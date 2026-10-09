/* @layer shared-game @kind logic */
import type { DialogueCharset, ExtraGlyphSlot } from './dialogue-charset.type';
import { GLYPH_SLOTS } from './dialogue-charset.constants';
import { extraTokenOf } from './extra-token-of';
import { withExtras } from './with-extras';

const dialogueCharsetOf = (alphabet: readonly string[], widths: Uint8Array, extras: readonly ExtraGlyphSlot[]): DialogueCharset => {
  const table = new Uint8Array(GLYPH_SLOTS);
  table.set(widths.subarray(0, GLYPH_SLOTS));
  for (const extra of extras) table[extra.slot] = extra.width;
  return { alphabet: withExtras(alphabet, extras, (extra) => extraTokenOf(extra.slot)), widths: table, extras };
};

export { dialogueCharsetOf };
