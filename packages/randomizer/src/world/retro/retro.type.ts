/* @layer shared-game @kind types */
import type { ShopSlotFacts } from '../shops/shop-slot-facts';

interface RetroBowSetting {
  enabled: boolean;
  woodArrowCost: number;
  silverArrowCost: number;
}

interface RetroCostCeilings {
  wood: number;
  silver: number;
}

interface RetroShelfStock extends ShopSlotFacts {
  role: 'quiver' | 'refill';
  refillItem: string;
  refillPrice: number;
  quiverPrice: number;
}

export type { RetroBowSetting, RetroCostCeilings, RetroShelfStock };
