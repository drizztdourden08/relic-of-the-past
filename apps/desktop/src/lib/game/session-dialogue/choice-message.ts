/* @layer bridge-wasm @kind logic */
import { toDialogueText } from './dialogue-text';
import { VISIBLE_ROWS, fitsRows, wrapRows } from './wrap-message';
import { CHOOSE_COMMAND, ROW_COMMANDS, SCROLL_COMMAND, WAIT_COMMAND } from './message-commands.constants';
import { INLINE_QUESTION_ROWS, NO_INDENT, YES_INDENT } from './choice-message.constants';
import type { DialogueCharset } from '@rotp/game-data';
import type { ChoiceReceiptLine } from '@shared/randomizer/receipt-text/receipt-line.type';

const answerRowsOf = (line: ChoiceReceiptLine, charset: DialogueCharset): string[] => [
  `${YES_INDENT}${toDialogueText(line.yes, charset)}`,
  `${NO_INDENT}${toDialogueText(line.no, charset)}`,
];

const fitCandidate = (candidates: readonly string[], rows: number, charset: DialogueCharset): string | undefined =>
  candidates.find((candidate) => fitsRows(candidate, rows, charset.alphabet, charset.widths));

const inlineText = (question: string, answers: readonly string[]): string =>
  `${[question, ...answers].map((row, index) => `${ROW_COMMANDS[index]}${row}`).join('')}${CHOOSE_COMMAND}`;

const pagedText = (questionRows: readonly string[], recap: string, answers: readonly string[]): string => {
  const rows = questionRows.map((row, index) =>
    (index < ROW_COMMANDS.length ? `${ROW_COMMANDS[index]}${row}` : `${WAIT_COMMAND}${SCROLL_COMMAND}${row}`));
  for (let index = questionRows.length; index < ROW_COMMANDS.length; index += 1) rows.push(ROW_COMMANDS[index]);
  const second = [recap, ...answers].map((row) => `${SCROLL_COMMAND}${row}`).join('');
  return `${rows.join('')}${WAIT_COMMAND}${second}${CHOOSE_COMMAND}`;
};

const promptRowOf = (line: ChoiceReceiptLine, saidRows: readonly string[], charset: DialogueCharset): string => {
  const candidates = (line.prompt === undefined ? [] : [line.prompt].flat())
    .map((text) => toDialogueText(text, charset));
  const fits = fitCandidate(candidates, INLINE_QUESTION_ROWS, charset);
  return fits ?? saidRows[saidRows.length - 1];
};

const choiceMessageText = (line: ChoiceReceiptLine, candidates: readonly string[], charset: DialogueCharset): string => {
  const answers = answerRowsOf(line, charset);
  const said = fitCandidate(candidates, VISIBLE_ROWS, charset) ?? candidates[candidates.length - 1];
  const saidRows = wrapRows(said, charset.alphabet, charset.widths);
  if (saidRows.length <= INLINE_QUESTION_ROWS) return inlineText(said, answers);
  return pagedText(saidRows, promptRowOf(line, saidRows, charset), answers);
};

export { choiceMessageText };
