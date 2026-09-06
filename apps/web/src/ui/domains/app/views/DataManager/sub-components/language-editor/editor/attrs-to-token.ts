/* @layer renderer-components @kind logic */
/**
 * The return half of the atom contract: an inline node back to the token it
 * stands for, and a paragraph's children back to one line's content.
 *
 * The walk is flat: a paragraph's children are either text nodes, which
 * accumulate into one maximal run, or atoms, which rebuild their original token
 * from the attributes. A run is flushed only when it is non-empty, so two
 * adjacent atoms produce no phantom empty text token between them. That is the
 * case a naive walker gets wrong.
 *
 * Values are read defensively, not trusted: a paste, an older stored
 * document, or a node view that stringified an attribute can all put a decimal
 * string where a number belongs, and an out-of-range row must still resolve to
 * something the model accepts. Anything unrecognisable is dropped, not
 * allowed to become an invalid token.
 *
 * Like its counterpart this module imports no editor runtime. It reads plain
 * ProseMirror JSON, so it needs no DOM.
 */
import { DIALOGUE_TOKEN_TYPE } from './token-attrs';
import type { JSONContent } from '@tiptap/core';
import type { Token } from '@shared/game/language';

/** A stored attribute may be a number or its decimal string form. */
const numberOf = (value: unknown): number | undefined => {
  if (typeof value === 'number') return Number.isFinite(value) ? value : undefined;
  if (typeof value !== 'string' || value.trim() === '') return undefined;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
};

const stringOf = (value: unknown): string => (typeof value === 'string' ? value : '');

/** Rows are the three line-start markers; anything else falls back to the first. */
const rowOf = (value: unknown): 1 | 2 | 3 => {
  const row = numberOf(value);
  return row === 2 || row === 3 ? row : 1;
};

const varNameOf = (value: unknown): 'player-name' | 'number' => (
  value === 'number' ? 'number' : 'player-name'
);

const cmdToken = (attrs: Record<string, unknown>): Token => {
  const name = stringOf(attrs.name);
  const param = numberOf(attrs.param);
  return param === undefined ? { t: 'cmd', name } : { t: 'cmd', name, param };
};

const varToken = (attrs: Record<string, unknown>): Token => {
  const name = varNameOf(attrs.name);
  const slot = numberOf(attrs.slot);
  return slot === undefined ? { t: 'var', name } : { t: 'var', name, slot };
};

/** Rebuild the token an atom stands for, or null if its attributes make no sense. */
const tokenFromAttrs = (attrs: Record<string, unknown> | null | undefined): Token | null => {
  if (attrs === null || attrs === undefined) return null;
  if (attrs.kind === 'break') return { t: 'break', row: rowOf(attrs.row) };
  if (attrs.kind === 'var') return varToken(attrs);
  if (attrs.kind === 'ref') return { t: 'ref', key: stringOf(attrs.key) };
  if (attrs.kind === 'cmd') return cmdToken(attrs);
  return null;
};

/** One line's content tokens, from the inline children of its paragraph. */
const inlineTokensOf = (block: JSONContent): Token[] => {
  const tokens: Token[] = [];
  let run = '';

  const flush = (): void => {
    if (run === '') return;
    tokens.push({ t: 'text', v: run });
    run = '';
  };

  for (const node of block.content ?? []) {
    if (node.type === 'text') {
      run += stringOf(node.text);
      continue;
    }
    if (node.type !== DIALOGUE_TOKEN_TYPE) continue;
    const token = tokenFromAttrs(node.attrs);
    if (token === null) continue;
    flush();
    tokens.push(token);
  }
  flush();

  return tokens;
};

export { inlineTokensOf, tokenFromAttrs };
