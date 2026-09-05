import React, { useState } from 'react';

/**
 * A two-step confirmation for a destructive action.
 *
 * Aurora has no red — the palette is Horizon Navy ink, Signal Blue action and
 * nothing else — so "this one is irreversible" cannot be said with colour.
 * It is said with friction instead: the trigger swaps in place for a prompt
 * that states the consequence, and the button that carries it out is labelled
 * with the verb ("Delete this load") rather than a bare "OK", so the action is
 * legible even to someone who never reads the prompt.
 *
 * This replaces window.confirm, which was both outside the design system and
 * unstyleable.
 *
 * @param {string} label        text on the button that opens the prompt
 * @param {string} prompt       what will happen, in one sentence
 * @param {string} confirmLabel verb-first text on the button that does it
 * @param {string} cancelLabel  the way back out
 * @param {function} onConfirm  called once, when confirmed
 */
const ConfirmAction = ({
  label,
  prompt,
  confirmLabel,
  cancelLabel = 'Keep it',
  onConfirm,
}) => {
  const [asking, setAsking] = useState(false);

  if (!asking) {
    return (
      <div className="au-actions">
        <button
          type="button"
          className="au-btn au-btn--secondary au-btn--sm"
          onClick={() => setAsking(true)}
        >
          {label}
        </button>
      </div>
    );
  }

  return (
    <div className="au-confirm" role="group" aria-label={label}>
      <p className="au-confirm__prompt">{prompt}</p>
      <div className="au-confirm__actions">
        <button
          type="button"
          className="au-btn au-btn--solid au-btn--sm"
          onClick={() => {
            setAsking(false);
            onConfirm();
          }}
        >
          {confirmLabel}
        </button>
        <button
          type="button"
          className="au-btn au-btn--secondary au-btn--sm"
          onClick={() => setAsking(false)}
        >
          {cancelLabel}
        </button>
      </div>
    </div>
  );
};

export default ConfirmAction;
