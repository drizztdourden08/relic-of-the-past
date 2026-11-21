/* @layer bridge-wasm @kind types */
import type { ExtraGlyphSlot } from '@rotp/game-data';
import type { EmscriptenModule } from '../../types';

interface LetterSource {
  sheet: Uint8Array;
  texts: readonly string[];
  eu: boolean;
  baked: readonly string[];
}

interface SessionLettersArgs {
  mod: EmscriptenModule;
  alphabet: readonly string[];
  widths: Uint8Array;
  extras: readonly ExtraGlyphSlot[];
  source: LetterSource;
}

export type { LetterSource, SessionLettersArgs };
