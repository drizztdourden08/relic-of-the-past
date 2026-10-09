/* @layer shared-game @kind types */
import type { RegionId } from '@rotp/game-data';
import type { ItemKey } from './item-ids.data';
import type { ActToken } from './events/event-gate.type';
import type { World } from './world.type';

type Holding = ItemKey | ActToken;

interface CollectionState {
  readonly world: World;
  readonly progItems: Map<Holding, number>;
  readonly reachableRegions: Set<RegionId>;
  staleReachability: boolean;
  has(item: Holding, count?: number): boolean;
  hasAny(items: readonly Holding[]): boolean;
  count(item: Holding): number;
  countGroup(items: readonly Holding[]): number;
  hasGroup(items: readonly Holding[]): boolean;
  collect(item: Holding): void;
  remove(item: Holding): void;
  canReachRegion(region: RegionId): boolean;
}

export type { CollectionState, Holding };
