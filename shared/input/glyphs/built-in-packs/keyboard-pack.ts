/* @layer shared-input @kind logic */
import { KEYBOARD_DEFAULT } from '../../keyboard-default';
import { keyboardGlyphPath } from '../keyboard-glyph-path';
import { builtInGlyphSource } from './built-in-glyph-source';
import { CONSOLE_LAYOUT, GENERIC_PACK_ID } from './built-in-packs.constants';
import type { SdlButtonName } from '../../family';
import type { GlyphPack } from '@shared/types/hud/glyph-pack';
import type { GlyphTable } from './built-in-packs.type';

const keyboardPack = (): GlyphPack => {
  const byConsoleButton = new Map(KEYBOARD_DEFAULT.defaultMappings.map(mapping => [mapping.snesButton, mapping.binding]));
  const glyphs: GlyphTable = {};
  for (const [position, snesButton] of Object.entries(CONSOLE_LAYOUT)) {
    const binding = snesButton ? byConsoleButton.get(snesButton) : undefined;
    if (binding?.type !== 'keyboard') continue;
    const assetPath = keyboardGlyphPath(binding.code);
    if (assetPath) glyphs[position as SdlButtonName] = builtInGlyphSource(assetPath);
  }
  return { id: 'keyboard', name: 'Keyboard', builtIn: true, glyphs, fallbackPack: GENERIC_PACK_ID };
};

export { keyboardPack };
