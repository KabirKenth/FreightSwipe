import React, { useEffect, useRef, useState } from 'react';

/**
 * Reads one address component, tolerating both the new Places shape
 * (longText / shortText) and the legacy one (long_name / short_name).
 */
const part = (components, type, { short = false } = {}) => {
  const found = (components || []).find((c) => (c.types || []).includes(type));
  if (!found) return '';
  return short
    ? (found.shortText ?? found.short_name ?? '')
    : (found.longText ?? found.long_name ?? '');
};

/** Flattens Google's address components into the shape the API expects. */
export const toAddress = (components) => ({
  address: `${part(components, 'street_number')} ${part(components, 'route')}`.trim(),
  city:
    part(components, 'locality') ||
    part(components, 'postal_town') ||
    part(components, 'sublocality'),
  province: part(components, 'administrative_area_level_1', { short: true }),
  postalCode: part(components, 'postal_code'),
  country: part(components, 'country'),
});

/**
 * Address search built on google.maps.places.PlaceAutocompleteElement.
 *
 * The old google.maps.places.Autocomplete widget (which @react-google-maps/api
 * wraps) stopped being served to Google Cloud projects created after 1 March
 * 2025: the class still loads but returns no predictions. This uses the current
 * element instead, and requires "Places API (New)" enabled on the project.
 *
 * It only fills in the fields below it -- those inputs remain the source of
 * truth -- so if Places is unavailable for any reason this simply does not
 * render and the form is still completable by hand.
 */
export default function PlaceAutocomplete({ ready, onSelect }) {
  const hostRef = useRef(null);
  const onSelectRef = useRef(onSelect);
  const [available, setAvailable] = useState(false);

  onSelectRef.current = onSelect;

  useEffect(() => {
    const host = hostRef.current;
    const Ctor = ready && window.google?.maps?.places?.PlaceAutocompleteElement;
    if (!host || !Ctor) return undefined;

    let el;
    try {
      el = new Ctor();
    } catch (err) {
      // Places API (New) not enabled, or billing not attached.
      console.warn('Address autocomplete unavailable:', err && err.message);
      return undefined;
    }

    el.style.width = '100%';
    host.appendChild(el);
    setAvailable(true);

    const handleSelect = async (event) => {
      const prediction = event.placePrediction || (event.detail && event.detail.placePrediction);
      const place = prediction
        ? prediction.toPlace()
        : event.place || (event.detail && event.detail.place);
      if (!place) return;

      try {
        await place.fetchFields({ fields: ['addressComponents'] });
      } catch (err) {
        console.warn('Could not fetch place details:', err && err.message);
        return;
      }
      onSelectRef.current(toAddress(place.addressComponents));
    };

    // 'gmp-select' is the current event; 'gmp-placeselect' was its earlier name.
    el.addEventListener('gmp-select', handleSelect);
    el.addEventListener('gmp-placeselect', handleSelect);

    return () => {
      el.removeEventListener('gmp-select', handleSelect);
      el.removeEventListener('gmp-placeselect', handleSelect);
      el.remove();
      setAvailable(false);
    };
  }, [ready]);

  return (
    <div className={available ? 'mb-2' : ''}>
      <div ref={hostRef} />
      {available && (
        <div className="form-text">Search for an address to fill the fields below.</div>
      )}
    </div>
  );
}
