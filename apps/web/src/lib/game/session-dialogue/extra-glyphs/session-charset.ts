/* @layer bridge-wasm @kind logic */
import { dialogueCharsetOf, extraGlyphSlots } from '@shared/game/dialog/dialogue-charset';
import type { DialogueCharset } from '@shared/game/dialog/dialogue-charset';
import type { EmscriptenModule } from '../../types';
import { loadExtraGlyphs } from './load-extra-glyphs';

const sessionCharset = (mod: EmscriptenModule, alphabet: readonly string[], widths: Uint8Array): DialogueCharset => {
  const slots = extraGlyphSlots(alphabet, widths.length);
  return dialogueCharsetOf(alphabet, widths, loadExtraGlyphs(mod, slots) ? slots : []);
};

export { sessionCharset };
