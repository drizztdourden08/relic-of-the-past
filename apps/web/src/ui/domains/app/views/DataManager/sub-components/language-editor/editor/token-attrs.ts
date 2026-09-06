/* @layer renderer-components @kind logic */
/**
 * The ATOM contract: one non-text token as an indivisible inline node, and a
 * line's content as the inline children of a paragraph.
 *
 * What is an atom is now a shorter list than it used to be. A row marker and the
 * wait that closes a box are LINE STRUCTURE. They only ever occur at a line's
 * edges, so they live in the block's attributes (see `line-attrs.ts`) and never
 * appear in a run. What is left is what sits IN the text: a
 * substitution, a glossary reference, a picture character, and any control code
 * that really does take effect mid-line.
 *
 * This module is deliberately free of any editor-framework runtime import: it
 * builds plain ProseMirror JSON, which keeps it pure, DOM-free and testable on
 * its own. It also owns the attribute contract (`DialogueTokenAttrs`) that the
 * node extension declares and `attrs-to-token.ts` reads back, so the three stay
 * in step from one definition.
 *
 * Attribute convention: `null` means "this field is absent from the token".
 * `undefined` never appears, so a `param`/`slot` of 0 stays distinguishable from
 * no parameter at all.
 */
import type { JSONContent } from '@tiptap/core';
import type { Token } from '@shared/game/language';

/** Document node type name for every non-text token. */
const DIALOGUE_TOKEN_TYPE = 'dialogueToken';

/** Which token family an atom stands for. Mirrors `Token['t']` minus 'text'. */
type DialogueTokenKind = 'cmd' | 'break' | 'var' | 'ref';

/** The full attribute set of one atom; every field is always present. */
type DialogueTokenAttrs = {
  kind: DialogueTokenKind;
  /** Command name, or the variable's name ('player-name' | 'number'). */
  name: string | null;
  param: number | null;
  row: 1 | 2 | 3 | null;
  slot: number | null;
  key: string | null;
};

const kBlankAttrs: DialogueTokenAttrs = {
  kind: 'cmd', name: null, param: null, row: null, slot: null, key: null,
};

/** Lossless projection of one non-text token onto the attribute contract. */
const tokenToAttrs = (token: Token): DialogueTokenAttrs | null => {
  if (token.t === 'text') return null;
  if (token.t === 'break') return { ...kBlankAttrs, kind: 'break', row: token.row };
  if (token.t === 'var') {
    return { ...kBlankAttrs, kind: 'var', name: token.name, slot: token.slot ?? null };
  }
  if (token.t === 'ref') return { ...kBlankAttrs, kind: 'ref', key: token.key };
  return { ...kBlankAttrs, kind: 'cmd', name: token.name, param: token.param ?? null };
};

/**
 * One non-text token as an insertable document node. A toolbar hands this to
 * `editor.commands.insertContent` to drop an atom at the caret.
 */
const tokenToNode = (token: Token): JSONContent | null => {
  const attrs = tokenToAttrs(token);
  return attrs === null ? null : { type: DIALOGUE_TOKEN_TYPE, attrs };
};

/** Append text, folding it into the preceding run so no two text nodes adjoin. */
const appendText = (content: JSONContent[], value: string): void => {
  if (value === '') return;
  const last = content[content.length - 1];
  if (last !== undefined && last.type === 'text') {
    last.text = `${last.text ?? ''}${value}`;
    return;
  }
  content.push({ type: 'text', text: value });
};

/** One line's inline children: maximal text runs interleaved with atoms. */
const inlineContent = (tokens: Token[]): JSONContent[] => {
  const content: JSONContent[] = [];
  for (const token of tokens) {
    if (token.t === 'text') {
      appendText(content, token.v);
      continue;
    }
    const node = tokenToNode(token);
    if (node !== null) content.push(node);
  }
  return content;
};

export { DIALOGUE_TOKEN_TYPE, inlineContent, tokenToAttrs, tokenToNode };
export type { DialogueTokenAttrs, DialogueTokenKind };
