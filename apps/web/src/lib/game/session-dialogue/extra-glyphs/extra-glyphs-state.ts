/* @layer bridge-wasm @kind logic */
import type { ExtraGlyphSlot } from '@shared/game/dialog/dialogue-charset';

const extraGlyphsState: { loaded: readonly ExtraGlyphSlot[] } = { loaded: [] };

export { extraGlyphsState };
