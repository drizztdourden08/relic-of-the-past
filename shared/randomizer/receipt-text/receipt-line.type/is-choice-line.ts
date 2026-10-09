/* @layer shared-game @kind logic */
import type { ChoiceReceiptLine, ReceiptLine } from './receipt-line.type';

const isChoiceLine = (line: ReceiptLine): line is ChoiceReceiptLine => typeof line === 'object' && 'ask' in line;

export { isChoiceLine };
