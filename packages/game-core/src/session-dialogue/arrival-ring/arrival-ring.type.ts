/* @layer bridge-wasm @kind types */
import type { ReceiptLine } from '../../receipt-text/receipt-line.type';

interface ArrivalRing {
  readonly lines: ReceiptLine[];
  readonly busy: boolean[];
  next: number;
}

export type { ArrivalRing };
