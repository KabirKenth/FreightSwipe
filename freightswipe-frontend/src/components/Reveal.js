import React, { useEffect, useRef, useState } from 'react';

/**
 * Aurora's signature motion: a paragraph that starts in Fog and inks in to
 * Horizon Navy, word by word, as it crosses the viewport centreline.
 *
 * Not a fade -- each word transitions its own colour on a 40ms stagger, so a
 * paragraph fills in roughly 1.2s. Reserved for editorial body copy of 20+
 * words; never nav, buttons or meta labels. Honours prefers-reduced-motion via
 * the stylesheet, which paints every word at full ink when motion is reduced.
 */
const Reveal = ({ children, as: Tag = 'p', className = '' }) => {
  const ref = useRef(null);
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return undefined;

    // No IntersectionObserver (older Safari, jsdom in tests): show the text.
    if (typeof IntersectionObserver === 'undefined') {
      setRevealed(true);
      return undefined;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setRevealed(true);
            observer.disconnect();
          }
        });
      },
      // Fire once the paragraph has crossed the middle of the viewport.
      { rootMargin: '0px 0px -45% 0px', threshold: 0 }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  const words = String(children).split(/(\s+)/);

  return (
    <Tag ref={ref} className={`au-reveal${revealed ? ' is-revealed' : ''} ${className}`.trim()}>
      {words.map((word, i) =>
        /^\s+$/.test(word) ? (
          word
        ) : (
          <span
            key={i}
            className="au-reveal__word"
            style={{ transitionDelay: `${Math.min(i, 40) * 40}ms` }}
          >
            {word}
          </span>
        )
      )}
    </Tag>
  );
};

export default Reveal;
