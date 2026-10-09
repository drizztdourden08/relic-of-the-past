/* @layer bridge-wasm @kind logic */
import type { ExtraGlyphSlot } from '@rotp/game-data';
import { extraGlyphsState } from './extra-glyphs-state';

const loadedExtraGlyphs = (): readonly ExtraGlyphSlot[] => extraGlyphsState.loaded;

export { loadedExtraGlyphs };
