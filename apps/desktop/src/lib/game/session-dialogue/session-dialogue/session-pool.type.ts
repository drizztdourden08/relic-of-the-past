/* @layer bridge-wasm @kind types */
import type { ReceiptLine } from '@shared/randomizer/receipt-text/receipt-line.type';
import type { ActiveDialogue } from '../active-dialogue.type';
import type { ArrivalRing } from '../arrival-ring';

interface SessionPool {
  plannedLines: ReceiptLine[];
  arrivals: ArrivalRing;
  active: ActiveDialogue | null;
  baseId: number | null;
  readonly encoded: Map<string, Uint8Array>;
}

export type { SessionPool };
