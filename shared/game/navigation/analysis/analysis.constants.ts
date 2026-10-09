/* @layer shared-game @kind constants */
import type { TraversalRequirement } from '@rotp/game-data';

const DARK_WORLD_FLAG = 0x40;

const INVENTORY_PROGRESSION: TraversalRequirement[][] = [
  [],
  ['boots'],
  ['lift.1'],
  ['lift.1', 'boots'],
  ['lift.2'],
  ['flippers'],
  ['hammer'],
  ['hookshot'],
  ['bombs'],
  ['lift.1', 'lift.2', 'boots', 'flippers', 'hammer', 'hookshot', 'bombs', 'sword', 'mirror'],
];

export { DARK_WORLD_FLAG, INVENTORY_PROGRESSION };
