/* @layer shared-input @kind logic */
import { SELECT_BIT, X_BIT } from './remap-classic.constants';
import type { ClassicOptions } from './remap-classic.type';
import type { RemapResult } from './remap.type';

const swapMapAndSelect = (mask: number): number => {
  const x = (mask & X_BIT) !== 0;
  const select = (mask & SELECT_BIT) !== 0;
  if (x === select) return mask;
  return (mask & ~(X_BIT | SELECT_BIT)) | (x ? SELECT_BIT : 0) | (select ? X_BIT : 0);
};

const remapClassic = (mask: number, options: ClassicOptions): RemapResult => {
  const { mapOnSelect } = options;
  return { mask: mapOnSelect ? swapMapAndSelect(mask) : mask, activeItem: 0 };
};

export { remapClassic };
