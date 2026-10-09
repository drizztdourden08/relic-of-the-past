/* @layer bridge-wasm @kind constants */
import type { QuietReceiptKind } from '@shared/game/quiet-receipts';

const GATE_WORD = 5;

const AP_ONLINE_BIT = 1 << 26;
const AP_DEATH_LINK_BIT = 1 << 27;
const QUIET_RECEIPT_BITS: Readonly<Record<QuietReceiptKind, number>> = {
  rupees: 1 << 28,
  bombs: 1 << 29,
  arrows: 1 << 30,
};

export { GATE_WORD, AP_ONLINE_BIT, AP_DEATH_LINK_BIT, QUIET_RECEIPT_BITS };
