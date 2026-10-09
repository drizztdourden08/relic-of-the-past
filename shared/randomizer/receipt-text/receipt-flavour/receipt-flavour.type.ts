/* @layer shared-game @kind types */
import type { ReceiptCount } from '../receipt-counts';

type FlavourKey =
  | 'small-key' | 'dungeon-item' | 'heart-piece' | 'heart-container'
  | 'bottle' | 'crystal' | 'pendant' | 'triforce' | 'progressive' | 'quiver' | 'standard';

interface FlavourParams {
  key: FlavourKey;
  label: string;
  source: string;
  count?: ReceiptCount;
}

type FlavourBuilder = (params: FlavourParams) => readonly string[];

export type { FlavourBuilder, FlavourKey, FlavourParams };
