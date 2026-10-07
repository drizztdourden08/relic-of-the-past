/* @layer shared-input @kind logic */
/**
 * Classic strategy: the mask the profile's own SNES mappings already
 * produced, passed straight through. The console's own layout IS the
 * scheme here, so there is nothing to translate, and the host never drives
 * the equipped-item register (activeItem stays 0).
 *
 * The single option is the map/save swap: with `mapOnSelect` on, the two
 * bits trade places, so the button that opened the save prompt opens the
 * map and vice versa. It is a swap, not a copy, because leaving both on X
 * would make the save prompt unreachable.
 */
import { SNES_BUTTON_BITS } from '../../types/controls/snes';
import type { RemapResult } from './remap.type';

const X_BIT = 1 << SNES_BUTTON_BITS.X;
const SELECT_BIT = 1 << SNES_BUTTON_BITS.Select;

interface ClassicOptions {
  /** Select opens the map, X opens the save prompt. */
  mapOnSelect: boolean;
}

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
export type { ClassicOptions };
