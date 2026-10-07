/* @layer bridge-wasm @kind logic */
/**
 * A yes/no question laid out the way the game's own two-answer prompts are.
 *
 * The box shows three rows, the choose command parks the cursor on the last two
 * (messaging.c RenderText_Draw_Choose2LowOr3 redraws a fixed arrow over dialogue
 * rows 1 and 2), and the engine never waits on its own. So the answers leave one
 * row for the question, and anything longer is PAGED, never scrolled away: what
 * she says fills the box, the player clears it with a key, then the two answers
 * scroll in under the line's short prompt. That is the shape of the game's own
 * long prompt at the mysterious pond, three rows then a key then the answers.
 *
 * Paging is the normal case and one row is the exception. A line is meant to be
 * read, so the composer keeps the FULLEST wording the box can page and only lays
 * a question inline when that wording is itself a single row.
 */

import { toDialogueText } from './dialogue-text';
import { VISIBLE_ROWS, fitsRows, wrapRows } from './wrap-message';
import type { DialogueCharset } from '@shared/game/dialog/dialogue-charset';
import type { ChoiceReceiptLine } from '@shared/randomizer/receipt-text/receipt-line.type';

const YES_INDENT = '    > ';
const NO_INDENT = '       ';
const ROW_COMMANDS = ['', '[2]', '[3]'];
const SCROLL_COMMAND = '[Scroll]';
const WAIT_COMMAND = '[Waitkey]';
const CHOOSE_COMMAND = '[Choose]';
/** Rows a question may take and still stand in the box above both answers. */
const INLINE_QUESTION_ROWS = VISIBLE_ROWS - 2;

/** The two answers, indented the way the game's own two-answer lines indent theirs. */
const answerRowsOf = (line: ChoiceReceiptLine, charset: DialogueCharset): string[] => [
  `${YES_INDENT}${toDialogueText(line.yes, charset)}`,
  `${NO_INDENT}${toDialogueText(line.no, charset)}`,
];

/** The fullest candidate that fits |rows| rows, if any does. */
const fitCandidate = (candidates: readonly string[], rows: number, charset: DialogueCharset): string | undefined =>
  candidates.find((candidate) => fitsRows(candidate, rows, charset.alphabet, charset.widths));

/** One box: the question on the top row, both answers under it, nothing scrolled away. */
const inlineText = (question: string, answers: readonly string[]): string =>
  `${[question, ...answers].map((row, index) => `${ROW_COMMANDS[index]}${row}`).join('')}${CHOOSE_COMMAND}`;

/**
 * Two pages: the whole question, then a key, then the answers scrolling in under |recap|.
 *
 * The box has to hold three rows before the scrolls line up, which is why the rows the
 * question does not fill are opened empty; the game's own long prompt opens its third row the
 * same way. A question past three rows pages at every break too, so none of it scrolls unread.
 */
const pagedText = (questionRows: readonly string[], recap: string, answers: readonly string[]): string => {
  const rows = questionRows.map((row, index) =>
    (index < ROW_COMMANDS.length ? `${ROW_COMMANDS[index]}${row}` : `${WAIT_COMMAND}${SCROLL_COMMAND}${row}`));
  for (let index = questionRows.length; index < ROW_COMMANDS.length; index += 1) rows.push(ROW_COMMANDS[index]);
  const second = [recap, ...answers].map((row) => `${SCROLL_COMMAND}${row}`).join('');
  return `${rows.join('')}${WAIT_COMMAND}${second}${CHOOSE_COMMAND}`;
};

/** The one row above the answers: the line's own prompt, or the last row of what she said. */
const promptRowOf = (line: ChoiceReceiptLine, saidRows: readonly string[], charset: DialogueCharset): string => {
  const candidates = (line.prompt === undefined ? [] : [line.prompt].flat())
    .map((text) => toDialogueText(text, charset));
  const fits = fitCandidate(candidates, INLINE_QUESTION_ROWS, charset);
  return fits ?? saidRows[saidRows.length - 1];
};

/** The whole line, laid out with its two answers and the choose command. |candidates| are drawable already. */
const choiceMessageText = (line: ChoiceReceiptLine, candidates: readonly string[], charset: DialogueCharset): string => {
  const answers = answerRowsOf(line, charset);
  const said = fitCandidate(candidates, VISIBLE_ROWS, charset) ?? candidates[candidates.length - 1];
  const saidRows = wrapRows(said, charset.alphabet, charset.widths);
  if (saidRows.length <= INLINE_QUESTION_ROWS) return inlineText(said, answers);
  return pagedText(saidRows, promptRowOf(line, saidRows, charset), answers);
};

export { choiceMessageText };
