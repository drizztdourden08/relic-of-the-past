/* @layer renderer-components @kind hook */
/**
 * A FORMULA BEING EDITED EXPANDS OVER ITS SIBLINGS, IT NEVER PUSHES THEM (§58).
 *
 * §36 gave a half-width field `flex: 1 0 100%` while a formula was being typed
 * in it, so the pair REFLOWED: the sibling dropped to a new row and everything
 * under it moved down. That is a layout shift caused by touching a control, and
 * it is the same fault as a section whose pieces rearrange when one of them is
 * pressed. This whole pass exists to keep that rule:
 *
 * > "NOTHING IN A FUCKING SECTION SHOULD CHANGE WHEN CLICKING ANY FUCKING OTHER
 * > OPTION IN THAT SAME FUCKING SECTION!"
 *
 * SO THE FIELD'S BOX IS FROZEN AND ITS CONTROL FLOATS OUT OF IT. The root keeps
 * the exact height it had, which is what stops the ROW from changing height, and
 * `.field__control` is lifted out of flow, spanning the row and drawn above its
 * neighbours. Nothing beside it moves, because nothing beside it is asked to.
 *
 * IT MEASURES ON FOCUS, NOT ON PROMOTION, and that ordering is the whole hook.
 * Two things are wrong with measuring when the formula appears:
 *
 * - the class that floats the control would already be on, so what came back
 *   would be the floated box instead of the resting one;
 * - and by then the field is TALLER than it was. A `=` draws a live-result line
 *   under the input, so reserving the height measured at that moment reserved
 *   7px the field never had at rest, and the pair's other half moved DOWN by
 *   exactly that. That is the shift this whole mechanism exists to prevent. It
 *   was found by pressing it in the real app, not by reading the code.
 *
 * So the box is taken the moment the field takes focus, which is the last frame
 * in which it is certainly at rest, and held until focus leaves. A field that
 * was ALREADY a formula is measured with its result line, because that is what
 * IT looks like at rest. The rule is "whatever it was a moment ago", not "an
 * input row".
 *
 * ONE MEASUREMENT PER EDIT, for the same reason: re-measuring on every keystroke
 * would let the overlay chase the result line it is itself growing.
 */
import { useLayoutEffect, useState } from 'react';
import type { CSSProperties, RefObject } from 'react';

/**
 * The box the overlay spans. A pair lives in an `.hud-inspect__row`; section
 * one's two gap cells live in their own `.hud-layout-set__gaps`. Anything else
 * falls back to the field's own parent, which is the narrowest honest answer
 * and never the whole panel.
 */
const HOST_SELECTOR = '.hud-inspect__row, .hud-layout-set__gaps, .hud-keyframes__row';

/** What the sheet reads. Kept as custom properties instead of as a `style`
 *  block so the rule that floats the control lives in CSS with the rest of the
 *  promotion, and this file only ever answers "where". */
interface PromoteBox {
  '--promote-left': string;
  '--promote-top': string;
  '--promote-width': string;
  '--promote-height': string;
}

const boxFor = (root: HTMLElement): PromoteBox | null => {
  const control = root.querySelector('.field__control');
  if (!(control instanceof HTMLElement)) return null;
  const host = root.closest(HOST_SELECTOR) ?? root.parentElement;
  const rootRect = root.getBoundingClientRect();
  const hostRect = (host ?? root).getBoundingClientRect();
  const controlRect = control.getBoundingClientRect();
  return {
    '--promote-left': `${Math.round(hostRect.left - rootRect.left)}px`,
    '--promote-top': `${Math.round(controlRect.top - rootRect.top)}px`,
    '--promote-width': `${Math.round(hostRect.width)}px`,
    '--promote-height': `${Math.round(rootRect.height)}px`,
  };
};

/**
 * `focused` says when to MEASURE and `formula` says when to FLOAT. Returns the
 * class the sheet keys off and the numbers it needs. Both are empty until the
 * resting geometry has been read, so the first painted frame is never a
 * half-promoted one.
 */
const usePromoteOverlay = (
  focused: boolean, formula: boolean, inputRef: RefObject<HTMLInputElement | null>,
): { className: string; style: CSSProperties | undefined } => {
  const [box, setBox] = useState<PromoteBox | null>(null);

  useLayoutEffect(() => {
    if (!focused) {
      setBox(null);
      return;
    }
    const root = inputRef.current?.closest('.hud-value-field');
    if (root instanceof HTMLElement) setBox(boxFor(root));
  }, [focused, inputRef]);

  const on = focused && formula && box !== null;
  return {
    className: on ? ' hud-value-field--wide' : '',
    style: on ? (box as unknown as CSSProperties) : undefined,
  };
};

export { HOST_SELECTOR, boxFor, usePromoteOverlay };
export type { PromoteBox };
