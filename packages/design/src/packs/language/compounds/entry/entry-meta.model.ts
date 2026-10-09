/* @layer renderer-components @kind logic */
import { summarizeEntry } from './entry-summary';
import type { BlockDoc, Token, VariableIndex } from '@rotp/languages';
import { BLOCK_END_WORDS } from './entry.constants';
import type { MetaParams, MetaRow, TriggerFacts } from './entry.type';

const blockWords = (doc: BlockDoc): string => {
  const { blocks } = doc;
  if (blocks.length === 0) return 'none';
  const ends = blocks.map((block) => BLOCK_END_WORDS[block.ends]).join(', ');
  return `${blocks.length} (${ends})`;
};

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
      value: `${facts.nativeKey || 'nothing recorded'} (no record carries this key yet)`,
      absent: true,
    };
};

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

export { entryMetaRows };
