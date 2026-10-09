/* @layer shared-input @kind logic */
import { CONSOLE_LAYOUT, GENERIC_PACK_ID } from './built-in-packs.constants';
import { SNES_ICON_KEYS } from './built-in-packs.data';
import { tableFromIcons } from './table-from-icons';
import type { GlyphPack } from '../../types/glyph-pack';
import type { IconKeyTable } from './built-in-packs.type';

const snesPack = (): GlyphPack => {
  const icons: IconKeyTable = {};
  for (const [position, snesButton] of Object.entries(CONSOLE_LAYOUT)) {
    if (snesButton) icons[position] = SNES_ICON_KEYS[snesButton];
  }
  return {
    id: 'snes', name: 'Console', builtIn: true,
    glyphs: tableFromIcons(icons), fallbackPack: GENERIC_PACK_ID,
  };
};

export { snesPack };
