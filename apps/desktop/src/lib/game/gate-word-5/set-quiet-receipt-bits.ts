/* @layer bridge-wasm @kind logic */
import { QUIET_RECEIPT_KINDS } from '@rotp/game-data';
import type { QuietReceiptKind } from '@rotp/game-data';
import { QUIET_RECEIPT_BITS } from './gate-word-5.constants';
import { gateWord5State } from './gate-word-5-state';
import { writeGateWord5 } from './write-gate-word-5';

const setQuietReceiptBits = (on: Readonly<Record<QuietReceiptKind, boolean>>): void => {
  const next = QUIET_RECEIPT_KINDS.reduce((bits, kind) => (on[kind] ? bits | QUIET_RECEIPT_BITS[kind] : bits), 0);
  if (next === gateWord5State.quietBits) return;
  gateWord5State.quietBits = next;
  writeGateWord5();
};

export { setQuietReceiptBits };
