/* @layer renderer-widgets @kind logic */
import type { AutoFloodParams } from './hooks.type';

const inventoryKeyOf = (equipment: AutoFloodParams['equipment'], inventoryItems: ArrayLike<number>): string =>
  `${equipment.sword},${equipment.gloves},${equipment.boots ? 1 : 0},${equipment.flippers ? 1 : 0},${inventoryItems[2]},${inventoryItems[11]}`;

export { inventoryKeyOf };
