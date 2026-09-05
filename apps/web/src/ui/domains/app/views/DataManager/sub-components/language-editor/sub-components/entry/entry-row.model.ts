/* @layer renderer-components @kind logic */
/**
 * One closed row of the entry list, as strings.
 *
 * The row has to answer, at a glance and without being opened: which entry this
 * is, who says it, what opens it, how much of it there is, whether it fits, and
 * where a prompt's options lead. Deciding all of that here keeps the row
 * component down to layout, and keeps the wording testable without a browser.
 *
 * The excerpt is last on purpose. It is the only part that can be long, so it
 * takes whatever room is left instead of pushing the facts off the row.
 */
import { contextFor } from '@shared/game/data/dialogue-context';
import type { DialogueChoice, DialogueTrigger } from '@shared/game/data/dialogue-context';
import type { BlockDoc, DialogueEntry, EntryIssue, VariableIndex } from '@shared/game/language';
import { excerptOf } from './entry-prose';
import { factsForEntry } from './trigger-facts';

/** Characters of the line worth showing on a closed row. */
const EXCERPT_LIMIT = 96;

/** What opens this entry, in two words at most. */
const TRIGGER_WORDS: Record<DialogueTrigger, string> = {
  talk: 'talk',
  sign: 'sign',
  telepathy: 'telepathy',
  'item-get': 'item get',
  menu: 'menu',
  cutscene: 'cutscene',
  system: 'system',
  'choice-cursor': 'cursor overlay',
  unknown: '',
};

type EntryRowModel = {
  id: number;
  /** `#023`, at a fixed width so the column stays a column. */
  idLabel: string;
  /**
   * Who or what opens it. For a source keyed by a PLACE or a ROOM this is the
   * place, not the generic phrase for the mechanism: which sign is the
   * identifying fact, and the trigger badge beside it already says it is a sign.
   * Empty when the data has no name for the key at all.
   */
  who: string;
  /** The kind of thing this is: talk, sign, telepathy, menu. */
  trigger: string;
  /** `2 blocks · 5 lines`, or a shorter phrase when either is one. */
  size: string;
  /** `→ #146 / #147`, or the option count when no branch is known. Empty when none. */
  choice: string;
  /** The full branch list, for the hover the compact form cannot carry. */
  choiceDetail: string;
  /** The line itself, one row's worth. */
  excerpt: string;
  /** Short wording for each validation problem. */
  issues: string[];
};

/** Short, human wording for one issue. A row has no space for a sentence. */
const issueWords = (issue: EntryIssue): string => (
  issue.kind === 'char-not-in-alphabet'
    ? `"${issue.ch}" has no glyph`
    : `missing "${issue.key}"`
);

const plural = (count: number, noun: string): string =>
  `${count} ${noun}${count === 1 ? '' : 's'}`;

const sizeWords = (blocks: number, lines: number): string =>
  `${plural(blocks, 'block')} · ${plural(lines, 'line')}`;

/** `→ #146 / #147`, or the option count when no branch was proven. */
const choiceWords = (choice: DialogueChoice): string => {
  const targets = [...new Set(choice.outcomes.map((outcome) => outcome.entry))];
  return targets.length > 0
    ? `→ ${targets.map((entry) => `#${entry}`).join(' / ')}`
    : `${choice.options} options`;
};

const choiceDetailWords = (choice: DialogueChoice): string => choice.outcomes
  .map((outcome) => `option ${outcome.option} → #${outcome.entry}${outcome.when ? ` (${outcome.when})` : ''}`)
  .join('\n');

type EntryRowParams = {
  entry: DialogueEntry;
  blocks: BlockDoc;
  lineCount: number;
  variables: VariableIndex;
  issues?: EntryIssue[];
};

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
    issues: (issues ?? []).map(issueWords),
  };
};

export { entryRowModel, TRIGGER_WORDS };
export type { EntryRowModel };
