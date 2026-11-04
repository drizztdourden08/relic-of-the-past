/* @layer shared-game @kind types */
import type { CollectionState as WorldCollectionState } from '@drizztdourden08/brock-randomizer/world';
import type { ItemKey } from './item-ids';
import type { ActToken } from './events/event-gate.type';
import type { RotpWorld } from './world.type';

type Holding = ItemKey | ActToken;

type CollectionState = WorldCollectionState<RotpWorld>;

export type { CollectionState, Holding };
