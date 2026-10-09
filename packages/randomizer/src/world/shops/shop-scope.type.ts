/* @layer shared-game @kind types */

type ShopShuffleMode = 'vanilla' | 'sequential' | 'random' | 'custom';

interface ShopScope {
  mode: ShopShuffleMode;
  enabled: readonly number[];
  slotCount: number;
  depth: number;
  seed: string;
}

export type { ShopScope, ShopShuffleMode };
