/* @layer renderer-lib @kind logic */
import { isInputIconName } from '@drizztdourden08/tessera/primitives';
import type { InputIconSource } from '@drizztdourden08/tessera/primitives';
import { GENERIC_GLYPH_NAMES, GLYPH_FAMILY } from './glyph-icon.constants';

const glyphIcon = (glyph: string): InputIconSource | null => {
  const cut = glyph.indexOf('-');
  const family = cut > 0 ? GLYPH_FAMILY[glyph.slice(0, cut)] : undefined;
  if (!family) return null;
  const tail = glyph.slice(cut + 1);
  const name = family === 'generic' ? (GENERIC_GLYPH_NAMES[tail] ?? tail) : tail;
  return isInputIconName(family, name) ? ({ family, name } as InputIconSource) : null;
};

export { glyphIcon };
