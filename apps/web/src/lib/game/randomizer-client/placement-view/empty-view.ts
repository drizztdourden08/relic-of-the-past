/* @layer bridge-wasm @kind logic */
import type { PlacementView } from './placement-view.type';

const emptyView = (): PlacementView => ({
  itemByCheck: new Map(),
  foreignByCheck: new Map(),
  sphereByCheck: new Map(),
  unmatchedLocations: [],
  unmatchedItems: [],
});

export { emptyView };
