/* @layer shared-game @kind logic */
/**
 * Bracket string to token stream — the import half of the adapter between the
 * stored dialogue dump format (produced by `formatDialogueText` in
 * shared/asset-extraction/text/dialogue-decoder.ts) and the editable
 * language-set model.
 *
 * Classification is purely syntactic: no language config is consulted, so one
 * parse serves every entry of `kLanguages`.
 *
 *   [1] [2] [3]      -> break tokens (the line-start markers)
 *   [Name]           -> var, the player character's name substitution
 *   [Number NN]      -> var, a numeric-value substitution in slot NN
 *   [Word NN]        -> cmd carrying a numeric param
 *   [anything else]  -> cmd with no param
 *
 * That last rule deliberately also absorbs the bracketed *pseudo-glyph* entries
 * some alphabet tables carry (icon/button/arrow/ellipsis names). Those are
 * ordinary characters rather than control codes, but they are spelled exactly
 * like a paramless code and no glyph name can collide with the param form,
 * because none of them contains a space. Treating them as paramless cmd tokens
 * therefore keeps `serializeTokens(parseTokens(s)) === s` exact for every
 * string the decoder can emit, which is the invariant that matters here. Any
 * later step that needs to tell a glyph from a real control code can look the
 * name up in the language's own alphabet array.
 *
 * `ref` tokens are never produced: a glossary reference only exists once a
 * translator tags one by hand.
 */
import type { Token } from '../types';

/** Every bracketed run, non-greedy on the closing bracket. */
const BRACKET_RE = /\[[^\]]*\]/g;

/** `Name Param` — command names never contain whitespace. */
const PARAM_RE = /^(\S+) (\d+)$/;

/** Command names that map onto the model's dedicated `var` token. */
const kPlayerNameCommand = 'Name';
const kNumberCommand = 'Number';

const isBreakRow = (name: string): name is '1' | '2' | '3' => (
  name === '1' || name === '2' || name === '3'
);

const paramlessToken = (name: string): Token => {
  if (isBreakRow(name)) return { t: 'break', row: Number(name) as 1 | 2 | 3 };
  if (name === kPlayerNameCommand) return { t: 'var', name: 'player-name' };
  if (name === kNumberCommand) return { t: 'var', name: 'number' };
  return { t: 'cmd', name };
};

/** Classify the inside of one bracketed run (brackets already stripped). */
const codeToken = (inner: string): Token => {
  const withParam = PARAM_RE.exec(inner);
  if (!withParam) return paramlessToken(inner);

  const name = withParam[1];
  const param = Number(withParam[2]);
  if (name === kNumberCommand) return { t: 'var', name: 'number', slot: param };
  return { t: 'cmd', name, param };
};

/**
 * Split one dialogue line into text runs and code tokens. Text runs are
 * maximal, so the result never holds two adjacent `text` tokens.
 */
const parseTokens = (content: string): Token[] => {
  const tokens: Token[] = [];
  let last = 0;

  for (const match of content.matchAll(BRACKET_RE)) {
    const start = match.index;
    if (start > last) tokens.push({ t: 'text', v: content.slice(last, start) });
    tokens.push(codeToken(match[0].slice(1, -1)));
    last = start + match[0].length;
  }
  if (last < content.length) tokens.push({ t: 'text', v: content.slice(last) });

  return tokens;
};

export { parseTokens };
