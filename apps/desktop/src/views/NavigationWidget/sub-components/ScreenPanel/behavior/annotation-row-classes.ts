/* @layer renderer-widgets @kind logic */
import { SETTLED_STATES } from './annotation-row-classes.constants';

const annotationRowClasses = (state: string | undefined, off: boolean) => {
  const settled = SETTLED_STATES.includes(state);
  const modifier = (base: string): string => (settled ? `${base} ${base}--settled` : base);
  return {
    settled,
    row: off ? 'nav-screen-panel__row nav-screen-panel__row--off' : 'nav-screen-panel__row',
    glyph: modifier('nav-screen-panel__glyph'),
    label: modifier('nav-screen-panel__label'),
  };
};

export { annotationRowClasses };
