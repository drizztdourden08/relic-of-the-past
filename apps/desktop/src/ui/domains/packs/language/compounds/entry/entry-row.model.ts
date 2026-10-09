/* @layer renderer-components @kind logic */
import { contextFor } from '@shared/game/data/dialogue-context';
import type { DialogueChoice } from '@shared/game/data/dialogue-context';
import type { EntryIssue } from '@shared/game/language';
import { excerptOf } from './excerpt-of';
import { factsForEntry } from './facts-for-entry';
import { EXCERPT_LIMIT, TRIGGER_WORDS } from './entry.constants';
import type { EntryRowModel, EntryRowParams } from './entry.type';

const rowIssueWords = (issue: EntryIssue): string => (
  issue.kind === 'char-not-in-alphabet'
    ? `"${issue.ch}" has no glyph`
    : `missing "${issue.key}"`
);

const plural = (count: number, noun: string): string =>
  `${count} ${noun}${count === 1 ? '' : 's'}`;

const sizeWords = (blocks: number, lines: number): string =>
  `${plural(blocks, 'block')} · ${plural(lines, 'line')}`;

const choiceWords = (choice: DialogueChoice): string => {
  const targets = [...new Set(choice.outcomes.map((outcome) => outcome.entry))];
  return targets.length > 0
    ? `→ ${targets.map((entry) => `#${entry}`).join(' / ')}`
    : `${choice.options} options`;
};

const choiceDetailWords = (choice: DialogueChoice): string => choice.outcomes
  .map((outcome) => `option ${outcome.option} → #${outcome.entry}${outcome.when ? ` (${outcome.when})` : ''}`)
  .join('\n');

const entryRowModel = (params: EntryRowParams): EntryRowModel => {
  const { entry, blocks, lineCount, variables, issues } = params;
  const facts = factsForEntry(entry.id);
  const context = contextFor(entry.id);
  const choice = context?.choice;

  return {
    id: entry.id,
    idLabel: `#${String(entry.id).padStart(3, '0')}`,
    who: facts.where.length > 0 ? facts.where : facts.who,
    trigger: context ? TRIGGER_WORDS[context.trigger] : '',
    size: sizeWords(blocks.blocks.length, lineCount),
    choice: choice ? choiceWords(choice) : '',
    choiceDetail: choice ? choiceDetailWords(choice) : '',
    excerpt: excerptOf(entry.tokens, variables, EXCERPT_LIMIT),
    issues: (issues ?? []).map(rowIssueWords),
  };
};

export { entryRowModel };
