/* @layer shared-game @kind logic */
import type { QuietReceiptKind, QuietReceiptSettings } from './quiet-receipts.type';
import { QUIET_RECEIPT_DEFAULTS, QUIET_RECEIPT_KEY } from './quiet-receipts.constants';

const isQuietReceipt = (settings: Partial<QuietReceiptSettings> | null, kind: QuietReceiptKind): boolean => {
  const key = QUIET_RECEIPT_KEY[kind];
  return settings?.[key] ?? QUIET_RECEIPT_DEFAULTS[key];
};

export { isQuietReceipt };
