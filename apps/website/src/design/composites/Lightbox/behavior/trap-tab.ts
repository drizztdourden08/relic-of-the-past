/* @layer website-site @kind logic */
import { FOCUSABLE } from '../Lightbox.constants';

const trapTab = (event: KeyboardEvent, root: HTMLElement): void => {
  const stops = Array.from(root.querySelectorAll<HTMLElement>(FOCUSABLE));
  const first = stops[0];
  const last = stops[stops.length - 1];
  if (!first || !last) {
    event.preventDefault();
    return;
  }
  const active = document.activeElement;
  const inside = active instanceof HTMLElement && stops.includes(active);
  if (event.shiftKey && (active === first || !inside)) {
    event.preventDefault();
    last.focus();
  } else if (!event.shiftKey && (active === last || !inside)) {
    event.preventDefault();
    first.focus();
  }
};

export { trapTab };
