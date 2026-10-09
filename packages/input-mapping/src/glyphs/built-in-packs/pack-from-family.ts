/* @layer shared-input @kind logic */
import { GENERIC_PACK_ID } from './built-in-packs.constants';
import { tableFromIcons } from './table-from-icons';
import type { FamilyMetadata } from '../../family';
import type { GlyphPack } from '../../types/glyph-pack';
import type { IconKeyTable } from './built-in-packs.type';

const packFromFamily = (
  id: string,
  name: string,
  family: FamilyMetadata,
  extra?: IconKeyTable,
): GlyphPack => ({
  id,
  name,
  builtIn: true,
  glyphs: tableFromIcons(family.buttonIcons, family.axisIcons, extra),
  ...(id === GENERIC_PACK_ID ? {} : { fallbackPack: GENERIC_PACK_ID }),
});

export { packFromFamily };
