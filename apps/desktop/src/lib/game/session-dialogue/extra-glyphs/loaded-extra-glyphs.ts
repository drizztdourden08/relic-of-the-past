/* @layer bridge-wasm @kind logic */
import type { ExtraGlyphSlot } from '@shared/game/dialog/dialogue-charset';
import { extraGlyphsState } from './extra-glyphs-state';

const loadedExtraGlyphs = (): readonly ExtraGlyphSlot[] => extraGlyphsState.loaded;

export { loadedExtraGlyphs };
