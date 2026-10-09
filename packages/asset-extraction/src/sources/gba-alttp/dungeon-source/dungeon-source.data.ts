/* @layer shared-asset-extraction @kind data */
import type { DungeonInteractionKind } from '../../../dungeon/model';

const INTERACTION_ATTRIBUTES: Readonly<Record<number, DungeonInteractionKind>> = {
  0x08: 'deep-water',
  0x09: 'shallow-water',
  0x20: 'pit',
  0x22: 'stair',
  0x68: 'conveyor-up',
  0x69: 'conveyor-down',
  0x6a: 'conveyor-left',
  0x6b: 'conveyor-right',
};

export { INTERACTION_ATTRIBUTES };
