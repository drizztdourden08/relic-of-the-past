/* @layer shared-game @kind logic */
import type { GlossaryTerm, Token } from '../types';
import type { GlyphMetrics } from '../layout/types';
import { ROWS_PER_BOX } from '../layout/types';
import { advanceOfToken, isWaitToken } from './advance-codes';
import { lineMetrics } from './line-metrics';
import type { DialogueLineView, LineAdvance, LineDraft } from './types';

const emptyDraft = (advance: LineAdvance): LineDraft => ({ advance, tokens: [], endsBox: false });

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
