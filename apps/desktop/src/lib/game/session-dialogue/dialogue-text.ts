/* @layer bridge-wasm @kind logic */
import { isHighlightMarker } from '@shared/randomizer/receipt-text/highlight-markup';
import { alphabetChars } from '@rotp/game-data';
import type { DialogueCharset } from '@rotp/game-data';
import type { Resolver } from './dialogue-text.type';
import {
  COMBINING, INVISIBLE, LETTERS, MAX_DEPTH, NEAREST, SPACE, TYPOGRAPHIC, UNKNOWN,
} from './dialogue-text.constants';

const resolverOf = (charset: DialogueCharset): Resolver => ({
  drawn: alphabetChars(charset.alphabet),
  tokens: new Map(charset.extras.map((extra) => [extra.char, charset.alphabet[extra.slot]])),
});

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

const toDialogueText = (text: string, charset: DialogueCharset): string => {
  const resolver = resolverOf(charset);
  let out = '';
  for (const ch of text) out += resolveChar(ch, resolver, 0);
  return out.replace(/ {2,}/g, ' ').trim();
};

export { toDialogueText };
