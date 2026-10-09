/* @layer renderer-components @kind logic */
import type { SectionKey } from './bound-values.type';

const sectionOfPath = (path: string): SectionKey | null => {
  const head = path.split(/[.[]/, 1)[0];
  if (head === 'gap' || head === 'columns' || head === 'rows') return 'layout';
  if (head === 'size' || head === 'min' || head === 'max' || head === 'scale') return 'sizeBox';
  if (head === 'opacity' || head === 'visible' || head === 'style') return 'appearance';
  if (head === 'element') return 'content';
  if (head === 'animation') return 'animation';
  if (head === 'transition') return 'transitions';
  return null;
};

export { sectionOfPath };
