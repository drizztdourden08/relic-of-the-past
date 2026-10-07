/* @layer shared-input @kind data */
/**
 * The glyph packs that ship with the app, one per family.
 *
 * A pack is a family's own icon table with the keys resolved to asset paths, so
 * a family gaining a position or changing a glyph shows up here for free and
 * cannot drift. The generic pack is the single exception (`GENERIC_PACK_ART`,
 * below): where a family names two controls with one key, a labelled binding
 * row can live with it and a bare cluster chip cannot.
 *
 * Two packs have no family to derive from and are built from the console
 * mapping instead:
 *  - 'snes' draws the console's own artwork, reached through the generic
 *    family's console defaults (which position plays which console button).
 *  - 'keyboard' covers what SDL never enumerates, so the keyboard preset's
 *    own keys are placed on the positions their console button occupies.
 *
 * Both are keyed by SDL position like every other pack, so a caller asking
 * for a position never has to know which kind of pack answered.
 */
import { GAMECUBE_FAMILY, GENERIC_FAMILY, NINTENDO_FAMILY, PLAYSTATION_FAMILY, XBOX_FAMILY } from '../family';
import { KEYBOARD_DEFAULT } from '../keyboard-default';
import { glyphAssetPath } from './glyph-asset-paths';
import { keyboardGlyphPath } from './keyboard-glyph-path';
import type { FamilyMetadata, SdlAxisName, SdlButtonName } from '../family';
import type { GlyphPack, GlyphSource } from '@shared/types/hud/glyph-pack';
import type { SnesButton } from '../../types/controls';

type GlyphTable = Partial<Record<SdlButtonName | SdlAxisName, GlyphSource>>;

const builtIn = (assetPath: string): GlyphSource => ({ kind: 'built-in', assetPath });

const GENERIC_PACK_ID = 'generic';

/** Icon keys → sources, dropping any key with no artwork on disk so the
 *  fallback chain can answer for it instead. */
const tableFromIcons = (...tables: readonly (Partial<Record<string, string>> | undefined)[]): GlyphTable => {
  const glyphs: GlyphTable = {};
  for (const table of tables) {
    for (const [position, iconKey] of Object.entries(table ?? {})) {
      const assetPath = iconKey ? glyphAssetPath(iconKey) : null;
      if (assetPath) glyphs[position as SdlButtonName | SdlAxisName] = builtIn(assetPath);
    }
  }
  return glyphs;
};

const packFromFamily = (
  id: string,
  name: string,
  family: FamilyMetadata,
  extra?: Partial<Record<string, string>>,
): GlyphPack => ({
  id,
  name,
  builtIn: true,
  glyphs: tableFromIcons(family.buttonIcons, family.axisIcons, extra),
  ...(id === GENERIC_PACK_ID ? {} : { fallbackPack: GENERIC_PACK_ID }),
});

/**
 * The one place a pack overrides its family's icon key, and it is about
 * ARTWORK, not about the device.
 *
 * An unrecognised pad can stack four controls on one side (bumper, trigger and
 * two paddles), and the generic family names them all with the same two keys,
 * because a binding row shows the position's NAME next to the icon and can
 * afford the repetition. A cluster chip cannot: it is the glyph and nothing
 * else, so ZL and GL drawing the same picture makes them indistinguishable.
 * Same silhouette down a side, solid → filled → outline for the depth, and the
 * paddles take the third silhouette so a grip never reads as a trigger.
 */
const GENERIC_PACK_ART: Partial<Record<string, string>> = {
  LEFT_TRIGGER: 'generic-trigger-a-fill',
  RIGHT_TRIGGER: 'generic-trigger-b-fill',
  LEFT_PADDLE1: 'generic-trigger-c',
  RIGHT_PADDLE1: 'generic-trigger-c-fill',
  LEFT_PADDLE2: 'generic-trigger-a-outline',
  RIGHT_PADDLE2: 'generic-trigger-b-outline',
};

/** Console button → its own artwork's icon key. */
const SNES_ICON_KEYS: Record<SnesButton, string> = {
  A: 'snes-a', B: 'snes-b', X: 'snes-x', Y: 'snes-y', L: 'snes-l', R: 'snes-r',
  Start: 'snes-start', Select: 'snes-select',
  Up: 'snes-dup', Down: 'snes-ddown', Left: 'snes-dleft', Right: 'snes-dright',
};

/** SDL position → console button, straight from the generic family's own
 *  console defaults so the console packs sit where the console plays. */
const CONSOLE_LAYOUT = GENERIC_FAMILY.consoleDefaults ?? {};

const snesPack = (): GlyphPack => {
  const icons: Partial<Record<string, string>> = {};
  for (const [position, snesButton] of Object.entries(CONSOLE_LAYOUT)) {
    if (snesButton) icons[position] = SNES_ICON_KEYS[snesButton];
  }
  return {
    id: 'snes', name: 'Console', builtIn: true,
    glyphs: tableFromIcons(icons), fallbackPack: GENERIC_PACK_ID,
  };
};

const keyboardPack = (): GlyphPack => {
  const byConsoleButton = new Map(KEYBOARD_DEFAULT.defaultMappings.map(mapping => [mapping.snesButton, mapping.binding]));
  const glyphs: GlyphTable = {};
  for (const [position, snesButton] of Object.entries(CONSOLE_LAYOUT)) {
    const binding = snesButton ? byConsoleButton.get(snesButton) : undefined;
    if (binding?.type !== 'keyboard') continue;
    const assetPath = keyboardGlyphPath(binding.code);
    if (assetPath) glyphs[position as SdlButtonName] = builtIn(assetPath);
  }
  return { id: 'keyboard', name: 'Keyboard', builtIn: true, glyphs, fallbackPack: GENERIC_PACK_ID };
};

const BUILT_IN_GLYPH_PACKS: readonly GlyphPack[] = [
  packFromFamily('switch', 'Switch', NINTENDO_FAMILY),
  packFromFamily('xbox', 'Xbox', XBOX_FAMILY),
  packFromFamily('playstation', 'PlayStation', PLAYSTATION_FAMILY),
  packFromFamily('gc', 'GameCube', GAMECUBE_FAMILY),
  snesPack(),
  packFromFamily(GENERIC_PACK_ID, 'Generic', GENERIC_FAMILY, GENERIC_PACK_ART),
  keyboardPack(),
];

const findGlyphPack = (id: string, packs: readonly GlyphPack[] = BUILT_IN_GLYPH_PACKS): GlyphPack | null => {
  return packs.find(pack => pack.id === id) ?? null;
};

export { BUILT_IN_GLYPH_PACKS, GENERIC_PACK_ID, findGlyphPack };
export type { GlyphTable };
