/* @layer renderer-components @kind logic */
/**
 * One entry as ordinary prose — the words, with every substitution standing
 * where it will stand and nothing else.
 *
 * This is the reading view's whole content and the collapsed row's excerpt. It
 * runs the SHARED expansion in preview mode, the same call the fit measurement
 * makes, so the sentence read here is the sentence the box will hold rather than
 * a second interpretation of the stream.
 *
 * Expansion is strict by design — it throws on a reference the set has no
 * variable for — and a broken reference is exactly the state a translator needs
 * to see rather than a blank panel. So a failure falls back to a tolerant walk
 * that shows the unresolved key in braces and leaves the rest of the line
 * readable. The validation badge is what states the problem; this only refuses
 * to hide the words around it.
 *
 * Control codes contribute nothing: a pause draws no pixels, and a row marker or
 * a wait is structure, which the reading view deliberately does not show. A
 * bracketed name the catalog does NOT claim is a picture character of the
 * alphabet — it draws real ink, so it survives as its bracketed spelling rather
 * than being dropped with the codes.
 */
import { codeInfoFor, resolve } from '@shared/game/language';
import type { Token, VariableIndex } from '@shared/game/language';

/** Marks a reference the set cannot expand, so it reads as a fault, not a word. */
const unresolved = (key: string): string => `{${key}}`;

/** Text runs only, joined in order. */
const textOf = (tokens: Token[]): string =>
  tokens.map((token) => (token.t === 'text' ? token.v : '')).join('');

/** The walk used when expansion refuses: every reference shown, none resolved away. */
const tolerantText = (tokens: Token[], index: VariableIndex): string => tokens.map((token) => {
  if (token.t === 'text') return token.v;
  if (token.t !== 'ref') return '';
  return index.get(token.key)?.value ?? unresolved(token.key);
}).join('');

/**
 * The entry's words, with the engine's substitutions replaced by their sample
 * values. Row markers and waits leave a single space behind so two lines do not
 * run into one word.
 */
const flattened = (token: Token): Token[] => {
  if (token.t === 'break') return [{ t: 'text', v: ' ' }];
  if (token.t !== 'cmd') return [token];
  if (token.param !== undefined) return [];
  return codeInfoFor(token.name) ? [{ t: 'text', v: ' ' }] : [{ t: 'text', v: `[${token.name}]` }];
};

const proseOf = (tokens: Token[], index: VariableIndex): string => {
  const spaced = tokens.flatMap(flattened);

  try {
    return textOf(resolve(spaced, index, { mode: 'preview' }));
  } catch {
    return tolerantText(spaced, index);
  }
};

/** The same prose, collapsed to one line and cut to `limit` characters. */
const excerptOf = (tokens: Token[], index: VariableIndex, limit: number): string => {
  const line = proseOf(tokens, index).replace(/\s+/g, ' ').trim();
  return line.length <= limit ? line : `${line.slice(0, limit).trimEnd()}…`;
};

export { excerptOf, proseOf };
