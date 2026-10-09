/* @layer shared-game @kind logic */
import type { PageReceiptLine, PlainReceiptLine } from '@rotp/game-core';

const detailPage = (page: PlainReceiptLine): PageReceiptLine => ({ page });

export { detailPage };
