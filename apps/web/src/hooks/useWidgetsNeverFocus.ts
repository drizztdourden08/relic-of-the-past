/* @layer renderer-hooks @kind hook */
/**
 * Keeps the keyboard and the pad with the game while widgets are used. A click
 * on a widget button, tab or slider would give it focus, and from then on the
 * arrows, Enter and Space would drive that control instead of Link. So a press
 * inside a widget or its options panel never moves focus (its click still
 * fires), a slider or select gets it only for the length of the press, and
 * any focus that lands there some other way is dropped. Fields meant for
 * typing keep it.
 */
import { useEffect } from 'react';

const WIDGET_SCOPE = '.widget-dock, .widget-options';
const TYPING = 'input:not([type]), input[type="text"], input[type="search"], input[type="number"], textarea, [contenteditable="true"]';
/** Controls the pointer drives: they need focus during the press, and lose it on release. */
const PRESSED = 'input[type="range"], select';

const insideWidgets = (target: EventTarget | null): target is HTMLElement =>
  target instanceof HTMLElement && target.closest(WIDGET_SCOPE) !== null;

const dropFocus = (): void => {
  const active = document.activeElement;
  if (insideWidgets(active) && !active.closest(TYPING)) active.blur();
};

const useWidgetsNeverFocus = (): void => {
  useEffect(() => {
    const onMouseDown = (e: MouseEvent): void => {
      if (insideWidgets(e.target) && !e.target.closest(`${TYPING}, ${PRESSED}`)) e.preventDefault();
    };
    const onFocusIn = (e: FocusEvent): void => {
      if (insideWidgets(e.target) && !e.target.closest(`${TYPING}, ${PRESSED}`)) e.target.blur();
    };
    document.addEventListener('mousedown', onMouseDown, true);
    document.addEventListener('focusin', onFocusIn, true);
    document.addEventListener('pointerup', dropFocus, true);
    document.addEventListener('change', dropFocus, true);
    return () => {
      document.removeEventListener('mousedown', onMouseDown, true);
      document.removeEventListener('focusin', onFocusIn, true);
      document.removeEventListener('pointerup', dropFocus, true);
      document.removeEventListener('change', dropFocus, true);
    };
  }, []);
};

export { useWidgetsNeverFocus };
