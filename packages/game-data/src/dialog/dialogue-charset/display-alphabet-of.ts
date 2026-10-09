/* @layer shared-game @kind logic */
import type { ExtraGlyphSlot } from './dialogue-charset.type';
import { withExtras } from './with-extras';

const displayAlphabetOf = (alphabet: readonly string[], extras: readonly ExtraGlyphSlot[]): string[] =>
  withExtras(alphabet, extras, (extra) => extra.char);

export { displayAlphabetOf };
