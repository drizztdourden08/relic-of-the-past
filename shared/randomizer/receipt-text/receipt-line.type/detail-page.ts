/* @layer shared-game @kind logic */
import type { PageReceiptLine, PlainReceiptLine } from './receipt-line.type';

const detailPage = (page: PlainReceiptLine): PageReceiptLine => ({ page });

export { detailPage };
