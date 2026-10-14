/* @layer renderer-components @kind logic */
import type { OutlineRowClassInput } from './outline-row-classes.type';

const outlineRowClasses = (input: OutlineRowClassInput): string => {
  const { selected, dragging, dropClass, locked, isScreen, shaking } = input;
  return [
    'hud-outline__row',
    selected ? 'is-selected' : '',
    dragging ? 'is-dragging' : '',
    dropClass,
    locked ? 'is-locked' : '',
    isScreen ? 'is-screen' : '',
    shaking ? 'is-shaking' : '',
  ].filter(Boolean).join(' ');
};

export { outlineRowClasses };
