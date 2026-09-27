/* @layer bridge-wasm @kind logic */
/**
 * Encodes a prepared line that carries highlight markup (highlight-markup.ts) or extra-glyph
 * tokens (dialogue-charset.ts). The text between them is compressed on its own, so no dictionary
 * word reaches across one, and each becomes the core's control bytes:
 *
 * - A highlight marker (core/game-hooks/dialog_highlight.c): one byte 0x80 + span in the US
 *   encoding, 0x87 then 0x50 + span in the European one, span 0 closing, 1 primary, 2 secondary.
 * - An extra glyph (core/game-hooks/dialog_extra_glyphs.c): 0x83 then its slot in the US
 *   encoding, 0x87 then its slot in the European one.
 *
 * A line with neither encodes exactly as before.
 */
import { compressStrings } from '@shared/asset-extraction/text/dialogue-encoder';
import { usesNewFormat } from '@shared/asset-extraction/text/data/language-data';
import { extraSlotOfToken } from '@shared/game/dialog/dialogue-charset';
import { HIGHLIGHT_KIND } from '@shared/randomizer/receipt-text/highlight-markup';

const US_HIGHLIGHT_BYTE = 0x80;
const US_EXTRA_BYTE = 0x83;
const EU_PREFIX = 0x87;
const EU_HIGHLIGHT_SUB = 0x50;

/** The bytes of one highlight marker in language |code|. */
const highlightBytes = (kind: number, code: string): number[] =>
  (usesNewFormat(code) ? [EU_PREFIX, EU_HIGHLIGHT_SUB + kind] : [US_HIGHLIGHT_BYTE + kind]);

/** The bytes that draw the extra glyph in |slot| in language |code|. */
const extraGlyphBytes = (slot: number, code: string): number[] =>
  [usesNewFormat(code) ? EU_PREFIX : US_EXTRA_BYTE, slot];

/** The control bytes |ch| stands for, or undefined for plain text. */
const controlBytesOf = (ch: string, code: string): number[] | undefined => {
  const kind = HIGHLIGHT_KIND.get(ch);
  if (kind !== undefined) return highlightBytes(kind, code);
  const slot = extraSlotOfToken(ch);
  return slot === undefined ? undefined : extraGlyphBytes(slot, code);
};

/** The text split at its control characters: plain runs, and the bytes of each control between them. */
const splitControls = (text: string, code: string): { runs: string[]; controls: number[][] } => {
  const runs: string[] = [''];
  const controls: number[][] = [];
  for (const ch of text) {
    const bytes = controlBytesOf(ch, code);
    if (bytes === undefined) runs[runs.length - 1] += ch;
    else { controls.push(bytes); runs.push(''); }
  }
  return { runs, controls };
};

const encodeControlled = (runs: readonly string[], controls: readonly number[][], code: string): Uint8Array => {
  const chunks = compressStrings([...runs], code);
  const bytes: number[] = [];
  chunks.forEach((chunk, index) => {
    bytes.push(...chunk);
    if (index < controls.length) bytes.push(...controls[index]);
  });
  return new Uint8Array(bytes);
};

/** Every text encoded; one with no control characters comes out exactly as the plain encoder makes it. */
const compressMarkedStrings = (texts: readonly string[], code: string): Uint8Array[] =>
  texts.map((text) => {
    const { runs, controls } = splitControls(text, code);
    return controls.length === 0 ? compressStrings([text], code)[0] : encodeControlled(runs, controls, code);
  });

export { compressMarkedStrings, extraGlyphBytes, highlightBytes };
