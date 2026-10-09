/* @layer shared-input @kind constants */
import { GAMECUBE_FAMILY, GENERIC_FAMILY, NINTENDO_FAMILY, PLAYSTATION_FAMILY, XBOX_FAMILY } from '../../family';
import { GENERIC_PACK_ID } from './built-in-packs.constants';
import { GENERIC_PACK_ART } from './built-in-packs.data';
import { keyboardPack } from './keyboard-pack';
import { packFromFamily } from './pack-from-family';
import { snesPack } from './snes-pack';
import type { GlyphPack } from '@shared/types/hud/glyph-pack';

const BUILT_IN_GLYPH_PACKS: readonly GlyphPack[] = [
  packFromFamily('switch', 'Switch', NINTENDO_FAMILY),
  packFromFamily('xbox', 'Xbox', XBOX_FAMILY),
  packFromFamily('playstation', 'PlayStation', PLAYSTATION_FAMILY),
  packFromFamily('gc', 'GameCube', GAMECUBE_FAMILY),
  snesPack(),
  packFromFamily(GENERIC_PACK_ID, 'Generic', GENERIC_FAMILY, GENERIC_PACK_ART),
  keyboardPack(),
];

export { BUILT_IN_GLYPH_PACKS };
