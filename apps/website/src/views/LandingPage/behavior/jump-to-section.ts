/* @layer website-site @kind logic */
import { focusHeading } from './focus-heading';

const jumpToSection = (id: string): void => {
  document.getElementById(id)?.scrollIntoView();
  window.setTimeout(() => focusHeading(id), 0);
};

export { jumpToSection };
