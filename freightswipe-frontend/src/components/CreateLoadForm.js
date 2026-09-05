import React, { useState } from 'react';
import axios from 'axios';
import { useLoadScript } from '@react-google-maps/api';
import { API_BASE, errorMessage } from '../api';
import PlaceAutocomplete from './PlaceAutocomplete';

const libraries = ['places'];

const CreateLoadForm = ({ onNewLoad }) => {
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY,
    libraries,
  });

  const [originStreet, setOriginStreet] = useState('');
  const [originCity, setOriginCity] = useState('');
  const [originProvince, setOriginProvince] = useState('');
  const [originPostalCode, setOriginPostalCode] = useState('');
  const [originCountry, setOriginCountry] = useState('');

  const [destinationStreet, setDestinationStreet] = useState('');
  const [destinationCity, setDestinationCity] = useState('');
  const [destinationProvince, setDestinationProvince] = useState('');
  const [destinationPostalCode, setDestinationPostalCode] = useState('');
  const [destinationCountry, setDestinationCountry] = useState('');

  const [weight, setWeight] = useState('');
  const [budget, setBudget] = useState('');
  const [deadline, setDeadline] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Applies a place chosen in the address search to one end of the trip.
  const applyOrigin = (a) => {
    setOriginStreet(a.address);
    setOriginCity(a.city);
    setOriginProvince(a.province);
    setOriginPostalCode(a.postalCode);
    setOriginCountry(a.country);
  };

  const applyDestination = (a) => {
    setDestinationStreet(a.address);
    setDestinationCity(a.city);
    setDestinationProvince(a.province);
    setDestinationPostalCode(a.postalCode);
    setDestinationCountry(a.country);
  };

  const ensureString = (value) => (value != null ? String(value).trim() : '');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const originData = {
      address: ensureString(originStreet),
      city: ensureString(originCity),
      province: ensureString(originProvince),
      postalCode: ensureString(originPostalCode),
      country: ensureString(originCountry),
    };

    const destinationData = {
      address: ensureString(destinationStreet),
      city: ensureString(destinationCity),
      province: ensureString(destinationProvince),
      postalCode: ensureString(destinationPostalCode),
      country: ensureString(destinationCountry),
    };

    if (!originData.address || !originData.city || !originData.province || !originData.postalCode || !originData.country) {
      setError('All origin address fields are required.');
      return;
    }

    if (!destinationData.address || !destinationData.city || !destinationData.province || !destinationData.postalCode || !destinationData.country) {
      setError('All destination address fields are required.');
      return;
    }

    if (originData.address.toLowerCase() === destinationData.address.toLowerCase() &&
        originData.city.toLowerCase() === destinationData.city.toLowerCase() &&
        originData.province.toLowerCase() === destinationData.province.toLowerCase() &&
        originData.postalCode.toLowerCase() === destinationData.postalCode.toLowerCase() &&
        originData.country.toLowerCase() === destinationData.country.toLowerCase()) {
      setError('Origin and destination cannot be the same.');
      return;
    }

    if (!weight || parseFloat(weight) <= 0) {
      setError('Weight must be a positive number.');
      return;
    }

    if (!budget || parseFloat(budget) <= 0) {
      setError('Budget must be a positive number.');
      return;
    }

    if (!deadline) {
      setError('Deadline is required.');
      return;
    }

    const deadlineParts = deadline.split('-');
    const selectedDate = new Date(
      parseInt(deadlineParts[0], 10),
      parseInt(deadlineParts[1], 10) - 1,
      parseInt(deadlineParts[2], 10)
    );

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (selectedDate < today) {
      setError('Deadline cannot be in the past.');
      return;
    }

    try {
      const response = await axios.post(`${API_BASE}/loads`, {
        origin: originData,
        destination: destinationData,
        weight: parseFloat(weight),
        budget: parseFloat(budget),
        deadline: selectedDate.toISOString(),
        description: ensureString(description),
      }, { withCredentials: true });

      onNewLoad(response.data);
      setOriginStreet('');
      setOriginCity('');
      setOriginProvince('');
      setOriginPostalCode('');
      setOriginCountry('');
      setDestinationStreet('');
      setDestinationCity('');
      setDestinationProvince('');
      setDestinationPostalCode('');
      setDestinationCountry('');
      setWeight('');
      setBudget('');
      setDeadline('');
      setDescription('');
      setSuccess('Load created.');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error('Error creating load:', err);
      setError(errorMessage(err, 'Failed to create load'));
      setSuccess('');
    }
  };

  // The address search is a convenience, not a dependency: if Places is slow,
  // blocked or unavailable the form still works as plain text fields.
  const mapsReady = isLoaded && !loadError;

  return (
    <div className="au-card">
      {error && <div className="au-notice">{error}</div>}
      {success && <div className="au-notice au-notice--signal">{success}</div>}

      <form onSubmit={handleSubmit}>
        {/* ---------- Pickup ---------- */}
        <fieldset className="au-fieldset">
          <legend className="au-fieldset__legend">Pickup</legend>

          <PlaceAutocomplete ready={mapsReady} onSelect={applyOrigin} />

          <div className="au-field">
            <label className="au-label" htmlFor="origin-address">Street address</label>
            <input
              id="origin-address"
              type="text"
              className="au-input"
              value={originStreet}
              onChange={(e) => setOriginStreet(e.target.value)}
              required
            />
          </div>

          <div className="au-grid-2">
            <div className="au-field">
              <label className="au-label" htmlFor="origin-city">City</label>
              <input
                id="origin-city"
                type="text"
                className="au-input"
                value={originCity}
                onChange={(e) => setOriginCity(e.target.value)}
                required
              />
            </div>

            <div className="au-field">
              <label className="au-label" htmlFor="origin-province">State / province</label>
              <input
                id="origin-province"
                type="text"
                className="au-input"
                value={originProvince}
                onChange={(e) => setOriginProvince(e.target.value)}
                required
              />
            </div>

            <div className="au-field">
              <label className="au-label" htmlFor="origin-postal">Postal code</label>
              <input
                id="origin-postal"
                type="text"
                className="au-input"
                value={originPostalCode}
                onChange={(e) => setOriginPostalCode(e.target.value)}
                required
              />
            </div>

            <div className="au-field">
              <label className="au-label" htmlFor="origin-country">Country</label>
              <input
                id="origin-country"
                type="text"
                className="au-input"
                value={originCountry}
                onChange={(e) => setOriginCountry(e.target.value)}
                required
              />
            </div>
          </div>
        </fieldset>

        {/* ---------- Delivery ---------- */}
        <fieldset className="au-fieldset">
          <legend className="au-fieldset__legend">Delivery</legend>

          <PlaceAutocomplete ready={mapsReady} onSelect={applyDestination} />

          <div className="au-field">
            <label className="au-label" htmlFor="destination-address">Street address</label>
            <input
              id="destination-address"
              type="text"
              className="au-input"
              value={destinationStreet}
              onChange={(e) => setDestinationStreet(e.target.value)}
              required
            />
          </div>

          <div className="au-grid-2">
            <div className="au-field">
              <label className="au-label" htmlFor="destination-city">City</label>
              <input
                id="destination-city"
                type="text"
                className="au-input"
                value={destinationCity}
                onChange={(e) => setDestinationCity(e.target.value)}
                required
              />
            </div>

            <div className="au-field">
              <label className="au-label" htmlFor="destination-province">State / province</label>
              <input
                id="destination-province"
                type="text"
                className="au-input"
                value={destinationProvince}
                onChange={(e) => setDestinationProvince(e.target.value)}
                required
              />
            </div>

            <div className="au-field">
              <label className="au-label" htmlFor="destination-postal">Postal code</label>
              <input
                id="destination-postal"
                type="text"
                className="au-input"
                value={destinationPostalCode}
                onChange={(e) => setDestinationPostalCode(e.target.value)}
                required
              />
            </div>

            <div className="au-field">
              <label className="au-label" htmlFor="destination-country">Country</label>
              <input
                id="destination-country"
                type="text"
                className="au-input"
                value={destinationCountry}
                onChange={(e) => setDestinationCountry(e.target.value)}
                required
              />
            </div>
          </div>
        </fieldset>

        {/* ---------- The load ---------- */}
        <fieldset className="au-fieldset">
          <legend className="au-fieldset__legend">The load</legend>

          <div className="au-grid-2">
            <div className="au-field">
              <label className="au-label" htmlFor="load-weight">Weight (lbs)</label>
              <input
                id="load-weight"
                type="number"
                className="au-input"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                required
              />
            </div>

            <div className="au-field">
              <label className="au-label" htmlFor="load-budget">Budget ($)</label>
              <input
                id="load-budget"
                type="number"
                className="au-input"
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="au-field">
            <label className="au-label" htmlFor="load-deadline">Deadline</label>
            <input
              id="load-deadline"
              type="date"
              className="au-input"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
              required
            />
            <span className="au-help">The day it has to be delivered by.</span>
          </div>

          <div className="au-field">
            <label className="au-label" htmlFor="load-description">Description</label>
            <textarea
              id="load-description"
              className="au-textarea"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
            <span className="au-help">
              Optional. Anything a trucker should know before they swipe.
            </span>
          </div>
        </fieldset>

        <button type="submit" className="au-btn au-btn--primary">
          Post this load <span aria-hidden="true">&rarr;</span>
        </button>
      </form>
    </div>
  );
};

export default CreateLoadForm;
