/* @layer bridge-wasm @kind logic */
import { dialogueCharsetOf, extraGlyphSlots } from '@rotp/game-data';
import type { DialogueCharset } from '@rotp/game-data';
import type { EmscriptenModule } from '../../types';
import { sessionLetters } from '../letter-bank';
import type { LetterSource } from '../letter-bank';
import { loadExtraGlyphs } from './load-extra-glyphs';

const usedChars = (texts: readonly string[]): Set<string> => new Set(texts.flatMap((text) => [...text.normalize('NFC')]));

const sessionCharset = (
  mod: EmscriptenModule,
  alphabet: readonly string[],
  widths: Uint8Array,
  source?: LetterSource,
): DialogueCharset => {
  const slots = extraGlyphSlots(alphabet, widths.length, source && usedChars(source.texts));
  const extras = loadExtraGlyphs(mod, slots) ? slots : [];
  const letters = source ? sessionLetters(mod, alphabet, widths, extras, source) : [];
  return dialogueCharsetOf(alphabet, widths, extras, letters);
};

export { sessionCharset };
