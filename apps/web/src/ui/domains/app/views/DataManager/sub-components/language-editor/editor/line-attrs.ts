/* @layer renderer-components @kind logic */
/**
 * The attribute contract of ONE LINE — everything a paragraph has to remember
 * that is not its text.
 *
 * A line's two structural facts are the code that PUT THE PEN on its row and
 * whether it is followed by a wait. Neither is content: the engine only ever
 * meets them at a line's edges, so carrying them as attributes of the block is
 * both truer and easier to edit than burying them in the run as inline objects.
 *
 * The advance is stored SPLIT — a kind plus a row — rather than as the model's
 * union, because a ProseMirror attribute has to survive a trip through the DOM
 * as a string. `null` for the kind is a real value and means what the model
 * means by a null advance: this line carries no code of its own. It is written
 * back out exactly as it was read, which is what lets an untouched entry
 * round-trip.
 *
 * The rendered `data-*` attributes are not decoration either: the stylesheet
 * groups the lines of one box by looking for the line after a `data-ends-box`
 * one, so the box grouping needs no second source of truth.
 */
import type { LineAdvance } from '@shared/game/language';

/** The document's block type — one paragraph is one line. */
const DIALOGUE_LINE_TYPE = 'paragraph';

/** Which code started the line, as two flat attribute values. */
type LineAdvanceKind = 'row' | 'scroll' | null;

/** The full attribute set of one line; every field is always present. */
type DialogueLineAttrs = {
  advanceKind: LineAdvanceKind;
  advanceRow: 1 | 2 | 3 | null;
  /** True when a wait-for-button follows this line, closing the box. */
  endsBox: boolean;
};

const attrsForLine = (advance: LineAdvance, endsBox: boolean): DialogueLineAttrs => {
  if (advance === null) return { advanceKind: null, advanceRow: null, endsBox };
  if (advance.kind === 'scroll') return { advanceKind: 'scroll', advanceRow: null, endsBox };
  return { advanceKind: 'row', advanceRow: advance.row, endsBox };
};

/**
 * A stored row may arrive as a decimal string (a DOM attribute) or as a value
 * outside the three markers (a paste from somewhere else). It resolves to the
 * first row rather than to nothing: the line was authored WITH a code, and
 * dropping it would silently change what the engine draws.
 */
const rowOf = (value: unknown): 1 | 2 | 3 => {
  const row = typeof value === 'string' ? Number(value) : value;
  return row === 2 || row === 3 ? row : 1;
};

/** The advance a line's attributes stand for, as the model's own union. */
const advanceOfAttrs = (attrs: Record<string, unknown> | null | undefined): LineAdvance => {
  if (attrs === null || attrs === undefined) return null;
  if (attrs.advanceKind === 'scroll') return { kind: 'scroll' };
  if (attrs.advanceKind === 'row') return { kind: 'row', row: rowOf(attrs.advanceRow) };
  return null;
};

/** Absent, `false` and `'false'` all mean the same thing: no wait. */
const endsBoxOfAttrs = (attrs: Record<string, unknown> | null | undefined): boolean => (
  attrs?.endsBox === true || attrs?.endsBox === 'true'
);

export { advanceOfAttrs, attrsForLine, DIALOGUE_LINE_TYPE, endsBoxOfAttrs };
export type { DialogueLineAttrs, LineAdvanceKind };
