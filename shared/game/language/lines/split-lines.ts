/* @layer shared-game @kind logic */
/**
 * Cut a token stream into the lines an author edits.
 *
 * A line is closed by whatever comes next: the following advance code, a
 * wait-for-button, or the end of the entry. So a code is always the FIRST thing
 * in a line and a wait is always the LAST. That is why neither needs to sit
 * inline in the editor as a labelled chip.
 *
 * Nothing is normalised. An advance is stored as it was read, so a row marker
 * that disagrees with where the line actually sits stays exactly that, and
 * `joinLines` puts it back untouched. Synthesising a code for a NEW line is a
 * separate, explicit decision (`advanceForNewLine`).
 *
 * Numbering follows the pen in `layout/box-pen.ts`:
 *
 * - A row marker parks the pen at that row, so the line's row is the marker's.
 * - A scroll parks the pen on the BOTTOM row, so a scrolled line is row 3
 *   whatever came before it, including the irregular case of a scroll while the
 *   pen was still on row 1, where the box shifts the earlier rows off the top.
 * - A wait starts the next box, and a box begins at row 1. The pen itself is not
 *   moved by a wait, so a line with no code of its own is reported at row 1 by
 *   box convention; authored data reaches the next box through a row marker,
 *   which decides the row on its own anyway.
 */
import type { GlossaryTerm, Token } from '../types';
import type { GlyphMetrics } from '../layout/types';
import { ROWS_PER_BOX } from '../layout/types';
import { advanceOfToken, isWaitToken } from './advance-codes';
import { lineMetrics } from './line-metrics';
import type { DialogueLineView, LineAdvance } from './types';

/** A line before it is measured or numbered. */
type LineDraft = {
  advance: LineAdvance;
  tokens: Token[];
  endsBox: boolean;
};

const emptyDraft = (advance: LineAdvance): LineDraft => ({ advance, tokens: [], endsBox: false });

/** Where the pen ends up once this line's advance has been applied. */
const rowOf = (advance: LineAdvance): number => {
  if (advance === null) return 1;
  return advance.kind === 'row' ? advance.row : ROWS_PER_BOX;
};

const splitDrafts = (tokens: Token[]): LineDraft[] => {
  const drafts: LineDraft[] = [];
  let open: LineDraft | null = null;

  for (const token of tokens) {
    const advance = advanceOfToken(token);
    if (advance !== undefined) {
      if (open !== null) drafts.push(open);
      open = emptyDraft(advance);
      continue;
    }

    // Opened lazily: a line only exists once something lands on it, so a wait
    // followed by a row marker yields one line instead of an empty one first.
    if (open === null) open = emptyDraft(null);

    if (isWaitToken(token)) {
      open.endsBox = true;
      drafts.push(open);
      open = null;
      continue;
    }

    open.tokens.push(token);
  }

  if (open !== null) drafts.push(open);
  return drafts;
};

const splitLines = (
  tokens: Token[],
  metrics: GlyphMetrics,
  glossary: GlossaryTerm[],
): DialogueLineView[] => {
  let box = 0;

  return splitDrafts(tokens).map((draft, index) => {
    const view: DialogueLineView = {
      index,
      box,
      row: rowOf(draft.advance),
      advance: draft.advance,
      tokens: draft.tokens,
      endsBox: draft.endsBox,
      ...lineMetrics(draft.tokens, metrics, glossary),
    };

    if (draft.endsBox) box += 1;
    return view;
  });
};

export { splitLines };
