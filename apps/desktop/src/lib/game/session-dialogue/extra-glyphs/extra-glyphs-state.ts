/* @layer bridge-wasm @kind logic */
import type { ExtraGlyphSlot } from '@rotp/game-data';

const extraGlyphsState: { loaded: readonly ExtraGlyphSlot[] } = { loaded: [] };

export { extraGlyphsState };
