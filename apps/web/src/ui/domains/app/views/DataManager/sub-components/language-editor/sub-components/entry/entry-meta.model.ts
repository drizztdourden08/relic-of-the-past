/* @layer renderer-components @kind logic */
/**
 * Everything known about one entry, as labelled rows.
 *
 * The panel behind this answers the questions a translator cannot answer from
 * the words alone: who opens this, where, how the game finds it, how many boxes
 * the player pages through, and what the line pulls in at runtime. Each row is
 * one fact with its evidence beside it.
 *
 * A row is OMITTED when the fact does not apply and stated as absent when it
 * applies but is not known. Those are different things: an entry opened by the
 * core has no place, while two entries have no mined source at all and two type
 * bytes carry no record — and printing a plausible guess for either would be
 * worse than printing nothing.
 */
import { summarizeEntry } from '../entry-summary';
import type { Block, BlockDoc, EntryIssue, Token, VariableIndex } from '@shared/game/language';
import type { DialogueContext } from '@shared/game/data/dialogue-context';
import type { TriggerFacts } from './trigger-facts';

/** One labelled fact. `mono` is for a value that is an identifier, not prose. */
type MetaRow = {
  key: string;
  label: string;
  value: string;
  mono?: boolean;
  /** True when the value states an absence rather than a fact. */
  absent?: boolean;
};

const BLOCK_END_WORDS: Record<Block['ends'], string> = {
  wait: 'wait',
  'message-end': 'message end',
};

/** `2 boxes (wait, message end)`, so the pacing is readable without opening it. */
const blockWords = (doc: BlockDoc): string => {
  const { blocks } = doc;
  if (blocks.length === 0) return 'none';
  const ends = blocks.map((block) => BLOCK_END_WORDS[block.ends]).join(', ');
  return `${blocks.length} (${ends})`;
};

/** Every variable this entry pulls in, named as the variable list names it. */
const variableWords = (tokens: Token[], index: VariableIndex): string => {
  const keys: string[] = [];
  for (const token of tokens) {
    const key = token.t === 'var' ? token.name : (token.t === 'ref' ? token.key : null);
    if (key === null || keys.includes(key)) continue;
    keys.push(key);
  }
  return keys.map((key) => index.get(key)?.label ?? key).join(', ');
};

const sourceRow = (facts: TriggerFacts): MetaRow => (
  facts.citation.length > 0
    ? { key: 'source', label: 'source', value: facts.citation, mono: true }
    : { key: 'source', label: 'source', value: 'not recorded for this entry', absent: true }
);

const whoRow = (facts: TriggerFacts): MetaRow => {
  const key = facts.nativeKey.length > 0 ? ` · ${facts.nativeKey}` : '';
  return facts.who.length > 0
    ? { key: 'who', label: 'triggered by', value: `${facts.who}${key}` }
    : {
      key: 'who',
      label: 'triggered by',
      value: `${facts.nativeKey || 'nothing recorded'} — no record carries this key yet`,
      absent: true,
    };
};

type MetaParams = {
  tokens: Token[];
  facts: TriggerFacts;
  context: DialogueContext | null;
  blocks: BlockDoc;
  lineCount: number;
  variables: VariableIndex;
};

/** The panel's rows, in reading order. */
const entryMetaRows = (params: MetaParams): MetaRow[] => {
  const { tokens, facts, context, blocks, lineCount, variables } = params;
  const rows: MetaRow[] = [whoRow(facts)];

  if (facts.where.length > 0) rows.push({ key: 'where', label: 'where', value: facts.where });
  if (facts.alsoNames.length > 0) {
    rows.push({
      key: 'also',
      label: 'or possibly',
      value: facts.alsoNames.join(', '),
      absent: true,
    });
  }
  if (context !== null) {
    rows.push({ key: 'trigger', label: 'trigger', value: context.trigger });
  }
  rows.push(sourceRow(facts));
  rows.push({ key: 'blocks', label: 'blocks', value: blockWords(blocks), mono: true });
  rows.push({ key: 'lines', label: 'lines', value: String(lineCount), mono: true });

  const used = variableWords(tokens, variables);
  rows.push(used.length > 0
    ? { key: 'variables', label: 'variables', value: used }
    : { key: 'variables', label: 'variables', value: 'none', absent: true });

  const contains = summarizeEntry(tokens);
  if (contains.length > 0) {
    rows.push({ key: 'contains', label: 'contains', value: contains.join(' · ') });
  }

  return rows;
};

/** Short wording for one validation problem, for the panel's own badges. */
const issueWords = (issue: EntryIssue): string => (
  issue.kind === 'char-not-in-alphabet'
    ? `"${issue.ch}" is not in this set's alphabet`
    : `no variable named "${issue.key}"`
);

export { entryMetaRows, issueWords };
export type { MetaRow };
