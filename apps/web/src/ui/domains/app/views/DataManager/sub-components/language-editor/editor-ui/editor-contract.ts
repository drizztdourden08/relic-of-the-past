/* @layer renderer-components @kind barrel */
/**
 * The ONE import site for the sibling `editor/` module.
 *
 * Everything in this folder is presentation: the toolbar, the gutter, the
 * markers at a line's end, the chips, the legend. The document model belongs to
 * `editor/` and is owned there: how a token stream becomes a stack of lines and
 * back, what a line remembers, the atom's attribute contract, and which
 * extensions make up the schema. Routing every reference through this file
 * means a rename on that side is a one-line fix here, not a sweep across
 * a dozen components.
 */
export { docToLines, linesToDoc, linesOfTokens } from '../editor';
export { tokenToNode, DIALOGUE_TOKEN_TYPE } from '../editor';
export { advanceOfAttrs, DIALOGUE_LINE_TYPE, endsBoxOfAttrs, toggleWaitAt } from '../editor';
export { dialogueExtensions } from '../editor';
export type { DialogueTokenAttrs, DialogueTokenKind } from '../editor';
