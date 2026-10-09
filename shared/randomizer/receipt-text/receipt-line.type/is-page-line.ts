/* @layer shared-game @kind logic */
import type { PageReceiptLine, ReceiptLine } from './receipt-line.type';

const isPageLine = (line: ReceiptLine): line is PageReceiptLine => typeof line === 'object' && 'page' in line;

export { isPageLine };
