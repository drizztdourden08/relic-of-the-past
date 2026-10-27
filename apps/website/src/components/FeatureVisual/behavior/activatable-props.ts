/* @layer website-site @kind logic */
import type { HTMLAttributes, KeyboardEvent } from 'react';
import { ACTIVATE_KEYS } from './activatable-props.constants';

const activatableProps = (onActivate: () => void, label: string): HTMLAttributes<HTMLElement> => ({
  role: 'button',
  tabIndex: 0,
  'aria-label': label,
  onClick: onActivate,
  onKeyDown: (event: KeyboardEvent<HTMLElement>) => {
    if (event.target !== event.currentTarget || !ACTIVATE_KEYS.includes(event.key)) return;
    event.preventDefault();
    onActivate();
  },
});

export { activatableProps };
