/* @layer shared-game @kind types */
/**
 * One receipt line as the renderer hands it to the dialogue composer: a
 * single text, or a list of candidates from the fullest wording down to the
 * shortest. The text box shows three rows of a fixed pixel width and the
 * composer is the only place the real glyph widths are known, so it keeps
 * the first candidate that fits the box and falls back down the list, so a
 * long location name costs the source clause, never the numbers.
 *
 * A line can also be a yes/no question. It carries what she says as
 * candidates, a short prompt for the page the answers sit on, and the two
 * answers themselves. The first answer is the one the game reads as yes.
 * The box shows three rows and the answers take the lower two, so anything
 * longer than a row is paged: what she says, a key, then the prompt with the
 * answers under it (choice-message.ts).
 */

type PlainReceiptLine = string | readonly string[];

interface ChoiceReceiptLine {
  readonly ask: PlainReceiptLine;
  /** The one-row line above the answers; the last row of |ask| stands in when none fits. */
  readonly prompt?: PlainReceiptLine;
  readonly yes: string;
  readonly no: string;
}

type ReceiptLine = PlainReceiptLine | ChoiceReceiptLine;

const isChoiceLine = (line: ReceiptLine): line is ChoiceReceiptLine => typeof line === 'object' && 'ask' in line;

/** The candidates of a line, fullest first; a question's own candidates for a yes/no line. */
const receiptLineCandidates = (line: ReceiptLine): readonly string[] => {
  if (isChoiceLine(line)) return receiptLineCandidates(line.ask);
  return typeof line === 'string' ? [line] : line;
};

/** Every text a line carries, prompt and answers included: what tells two lines apart. */
const receiptLineKey = (line: ReceiptLine): string => {
  if (!isChoiceLine(line)) return receiptLineCandidates(line).join(' ');
  const prompts = line.prompt === undefined ? [] : [line.prompt].flat();
  return [...receiptLineCandidates(line), ...prompts, line.yes, line.no].join(' ');
};

export { isChoiceLine, receiptLineCandidates, receiptLineKey };
export type { ChoiceReceiptLine, PlainReceiptLine, ReceiptLine };
