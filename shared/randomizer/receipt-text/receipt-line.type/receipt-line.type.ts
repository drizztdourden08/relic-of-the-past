/* @layer shared-game @kind types */

type PlainReceiptLine = string | readonly string[];

interface ChoiceReceiptLine {
  readonly ask: PlainReceiptLine;
  readonly prompt?: PlainReceiptLine;
  readonly yes: string;
  readonly no: string;
}

interface PageReceiptLine {
  readonly page: PlainReceiptLine;
}

type ReceiptLine = PlainReceiptLine | ChoiceReceiptLine | PageReceiptLine;

export type { ChoiceReceiptLine, PageReceiptLine, PlainReceiptLine, ReceiptLine };
