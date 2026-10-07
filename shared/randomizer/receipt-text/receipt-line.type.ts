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
 *
 * A line can also be a detail page: the core shows it as the next page of the
 * line armed for the same receipt (receipt_pages.c), so the receipt reads the
 * way every other one does and the details follow a key press
 * (page-message.ts).
 */

type PlainReceiptLine = string | readonly string[];

interface ChoiceReceiptLine {
  readonly ask: PlainReceiptLine;
  /** The one-row line above the answers; the last row of |ask| stands in when none fits. */
  readonly prompt?: PlainReceiptLine;
  readonly yes: string;
  readonly no: string;
}

interface PageReceiptLine {
  readonly page: PlainReceiptLine;
}

type ReceiptLine = PlainReceiptLine | ChoiceReceiptLine | PageReceiptLine;

const isChoiceLine = (line: ReceiptLine): line is ChoiceReceiptLine => typeof line === 'object' && 'ask' in line;

const isPageLine = (line: ReceiptLine): line is PageReceiptLine => typeof line === 'object' && 'page' in line;

/** |page| as a detail page, shown after the receipt's own line. */
const detailPage = (page: PlainReceiptLine): PageReceiptLine => ({ page });

/** The candidates of a line, fullest first; a question's own candidates for a yes/no line. */
const receiptLineCandidates = (line: ReceiptLine): readonly string[] => {
  if (isChoiceLine(line)) return receiptLineCandidates(line.ask);
  if (isPageLine(line)) return receiptLineCandidates(line.page);
  return typeof line === 'string' ? [line] : line;
};

/** Every text a line carries, prompt and answers included: what tells two lines apart. */
const receiptLineKey = (line: ReceiptLine): string => {
  if (!isChoiceLine(line)) return receiptLineCandidates(line).join(' ');
  const prompts = line.prompt === undefined ? [] : [line.prompt].flat();
  return [...receiptLineCandidates(line), ...prompts, line.yes, line.no].join(' ');
};

export { detailPage, isChoiceLine, isPageLine, receiptLineCandidates, receiptLineKey };
export type { ChoiceReceiptLine, PageReceiptLine, PlainReceiptLine, ReceiptLine };
