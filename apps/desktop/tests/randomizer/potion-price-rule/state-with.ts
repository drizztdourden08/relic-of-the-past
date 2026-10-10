/* @layer tests @kind helper */
import { ITEM, REGION } from '@rotp/randomizer';
import type { CollectionState, World } from '@rotp/randomizer';

const emptyWorld = (): World => ({
  regions: new Map(),
  locationsByKey: new Map(),
  eventsByKey: new Map(),
  dungeons: new Map(),
  options: {
    keyDropShuffle: false,
    pondLocations: [],
    pondPrizeLocations: [],
    medallions: { mire: ITEM.bombos, turtleRock: ITEM.bombos },
  },
  rules: new Map(),
  locationRules: new Map(),
  eventRules: new Map(),
  itemRules: new Map(),
  alwaysAllow: new Map(),
  placedItems: new Map(),
  seedValues: new Map(),
  getRule: () => undefined,
  getLocationRule: () => undefined,
  getEventRule: () => undefined,
  getItemRule: () => () => true,
  isBeaten: () => false,
});

const stateWith = (bottles: number, atSeller: boolean): CollectionState => ({
  world: emptyWorld(),
  progItems: new Map(),
  reachableRegions: new Set(),
  staleReachability: false,
  has: () => bottles > 0,
  hasAny: () => bottles > 0,
  count: () => 0,
  countGroup: () => bottles,
  hasGroup: () => bottles > 0,
  collect: () => undefined,
  remove: () => undefined,
  canReachRegion: (region) => atSeller && region === REGION.potionSeller,
});

export { stateWith };
