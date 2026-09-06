/* @layer shared-game @kind types */
/**
 * One receipt line as the renderer hands it to the dialogue composer: a
 * single text, or a list of candidates from the fullest wording down to the
 * shortest. The text box shows three rows of a fixed pixel width and the
 * composer is the only place the real glyph widths are known, so it keeps
 * the first candidate that fits the box and falls back down the list, so a
 * long location name costs the source clause, never the numbers.
 */

type ReceiptLine = string | readonly string[];

/** The candidates of a line, fullest first. */
const receiptLineCandidates = (line: ReceiptLine): readonly string[] => (typeof line === 'string' ? [line] : line);

export { receiptLineCandidates };
export type { ReceiptLine };
