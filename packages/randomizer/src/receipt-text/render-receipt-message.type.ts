/* @layer shared-game @kind types */
import type { ReceiptCount } from './receipt-counts';

type ReceiptGrantKind = 'physical' | 'delivered';

interface ReceiptMessageParams {
  kind: ReceiptGrantKind;
  itemName: string;
  locationName: string;
  count?: ReceiptCount;
}

export type { ReceiptGrantKind, ReceiptMessageParams };
