/* @layer shared-game @kind constants */
import type { QuietReceiptKind, QuietReceiptSettings } from './quiet-receipts.type';

const QUIET_RECEIPT_KINDS: readonly QuietReceiptKind[] = ['rupees', 'bombs', 'arrows'];

const QUIET_RECEIPT_KEY: Readonly<Record<QuietReceiptKind, keyof QuietReceiptSettings>> = {
  rupees: 'quietRupees',
  bombs: 'quietBombs',
  arrows: 'quietArrows',
};

const QUIET_RECEIPT_DEFAULTS: QuietReceiptSettings = { quietRupees: false, quietBombs: false, quietArrows: false };

export { QUIET_RECEIPT_DEFAULTS, QUIET_RECEIPT_KEY, QUIET_RECEIPT_KINDS };
