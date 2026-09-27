/* @layer bridge-wasm @kind logic */
/**
 * Any text as a message box can draw it, the one function every composer runs its words through.
 * Each character resolves to the first of these that applies:
 *
 * 1. Highlight markup passes through untouched (highlight-markup.ts).
 * 2. A character the language's alphabet draws stays itself.
 * 3. A character with an extra glyph (dialogue-charset.ts) becomes its slot token.
 * 4. Typographic forms become their plain one: dashes a hyphen, curly quotes straight ones, the
 *    ellipsis three dots, any space a space.
 * 5. A compatibility or accented form becomes its base: a full-width letter the letter, an accented
 *    letter the plain one (é to e), a ligature its letters. A Latin letter with no such base takes
 *    its usual spelling (ß to ss, æ to ae, ł to l).
 * 6. With no slot left for it, a bracket becomes a parenthesis, a backslash a slash and a
 *    semicolon a comma.
 * 7. A control or joining character draws nothing.
 * 8. Anything else (another script, an emoji) is a question mark, which every alphabet draws.
 *
 * Runs of spaces fold into one and the ends are trimmed.
 */
import { isHighlightMarker } from '@shared/randomizer/receipt-text/highlight-markup';
import { alphabetChars } from '@shared/game/dialog/dialogue-charset';
import type { DialogueCharset } from '@shared/game/dialog/dialogue-charset';

const UNKNOWN = '?';
/** Depth of replacement chains: a replacement's own characters resolve once more, no further. */
const MAX_DEPTH = 2;

const TYPOGRAPHIC: ReadonlyMap<number, string> = new Map([
  [0x2010, '-'], [0x2011, '-'], [0x2012, '-'], [0x2013, '-'], [0x2014, '-'], [0x2015, '-'], [0x2212, '-'],
  [0x2018, "'"], [0x2019, "'"], [0x201a, ','], [0x201b, "'"], [0x2032, "'"], [0x00b4, "'"],
  [0x201c, '"'], [0x201d, '"'], [0x201e, '"'], [0x2033, '"'], [0x00ab, '"'], [0x00bb, '"'],
  [0x2026, '...'], [0x00d7, 'x'], [0x00b7, '.'], [0x2022, '*'],
]);

/** Latin letters Unicode gives no decomposition to. */
const LETTERS: ReadonlyMap<string, string> = new Map([
  ['ß', 'ss'], ['ẞ', 'SS'], ['æ', 'ae'], ['Æ', 'AE'], ['œ', 'oe'], ['Œ', 'OE'], ['ø', 'o'], ['Ø', 'O'],
  ['đ', 'd'], ['Đ', 'D'], ['ð', 'd'], ['Ð', 'D'], ['þ', 'th'], ['Þ', 'Th'], ['ł', 'l'], ['Ł', 'L'],
  ['ı', 'i'], ['ħ', 'h'], ['Ħ', 'H'], ['ŧ', 't'], ['Ŧ', 'T'],
]);

/** Shapes close enough to stand in when a font has no slot left for the real one. */
const NEAREST: ReadonlyMap<string, string> = new Map([
  ['[', '('], [']', ')'], ['{', '('], ['}', ')'], ['\\', '/'], [';', ','],
]);

const COMBINING = /\p{M}/gu;
const SPACE = /^\s$/u;
const INVISIBLE = /^[\p{Cc}\p{Cf}\p{M}]$/u;

interface Resolver {
  drawn: ReadonlySet<string>;
  tokens: ReadonlyMap<string, string>;
}

const resolverOf = (charset: DialogueCharset): Resolver => ({
  drawn: alphabetChars(charset.alphabet),
  tokens: new Map(charset.extras.map((extra) => [extra.char, charset.alphabet[extra.slot]])),
});

/** The base form of |ch|: compatibility forms folded and accents dropped, or |ch| itself. */
const baseFormOf = (ch: string): string => ch.normalize('NFKD').replace(COMBINING, '');

const resolveChar = (ch: string, resolver: Resolver, depth: number): string => {
  if (isHighlightMarker(ch) || resolver.drawn.has(ch)) return ch;
  const token = resolver.tokens.get(ch);
  if (token !== undefined) return token;
  const again = (text: string): string =>
    (depth >= MAX_DEPTH ? UNKNOWN : [...text].map((part) => resolveChar(part, resolver, depth + 1)).join(''));
  const typographic = TYPOGRAPHIC.get(ch.codePointAt(0) ?? 0);
  if (typographic !== undefined) return again(typographic);
  const base = baseFormOf(ch);
  if (base !== '' && base !== ch) return again(base);
  const letters = LETTERS.get(ch) ?? NEAREST.get(ch);
  if (letters !== undefined) return again(letters);
  if (SPACE.test(ch)) return resolver.drawn.has(' ') ? ' ' : '';
  if (INVISIBLE.test(ch)) return '';
  return UNKNOWN;
};

/** |text| with every character one the charset draws; markup kept, spaces folded, ends trimmed. */
const toDialogueText = (text: string, charset: DialogueCharset): string => {
  const resolver = resolverOf(charset);
  let out = '';
  for (const ch of text) out += resolveChar(ch, resolver, 0);
  return out.replace(/ {2,}/g, ' ').trim();
};

export { toDialogueText };
