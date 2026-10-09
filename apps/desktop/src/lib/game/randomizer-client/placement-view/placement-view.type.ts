/* @layer bridge-wasm @kind types */
import type { CheckId, ItemId } from '@shared/game/data';

interface PlacementView {
  itemByCheck: Map<CheckId, ItemId>;
  foreignByCheck: Map<CheckId, string>;
  sphereByCheck: Map<CheckId, number>;
  unmatchedLocations: string[];
  unmatchedItems: string[];
}

export type { PlacementView };
