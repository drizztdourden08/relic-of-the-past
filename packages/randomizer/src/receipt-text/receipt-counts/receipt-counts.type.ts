/* @layer shared-game @kind types */
import type { ItemKey } from '../../world/item-ids';
import type { LocationKey } from '../../world/location-key';

interface ReceiptCount {
  ordinal: number;
  total: number;
  required?: number;
}

interface ReceiptCountSource {
  locations: Readonly<Record<LocationKey, ItemKey>>;
  keyDropShuffle: boolean;
  completed: ReadonlySet<LocationKey>;
  triforceRequired?: number;
}

type ReceiptCountOf = (location: LocationKey) => ReceiptCount | undefined;

export type { ReceiptCount, ReceiptCountOf, ReceiptCountSource };
