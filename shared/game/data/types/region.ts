/* @layer shared-game @kind types */
import type { AreaId, DungeonId, LocationId, RegionId, ScreenId } from './ids';
import type { World } from '../enumeration/generated-types';
import type { ReviewMark } from './review';

/** A broad geographic zone, such as a mountain range, a village or a desert. */
interface AreaRecord {
  id: AreaId;
  world: World;
  /** The one name this area answers to. */
  name: string;
  review?: ReviewMark;
}

/** A named structure or landmark inside exactly one area, such as a dungeon or a village. */
interface LocationRecord {
  id: LocationId;
  areaId: AreaId;
  /** The one name this location answers to. */
  name: string;
  review?: ReviewMark;
}

/**
 * What a region is, against the two partitions above it: an area and a location say where a
 * screen SITS, a region says what a player can WALK without asking for anything. One level of
 * a mountain, one side of a ledge, one wing of a dungeon.
 */
type RegionType = 'light' | 'dark' | 'cave' | 'dungeon';

/** A place recorded by pixel box instead of by screen: the walkable level around a seed. */
interface RegionBounds {
  /** The overworld screen the box is measured in, which the area table files it under. */
  screenId: ScreenId;
  x0: number;
  x1: number;
  y0: number;
  y1: number;
}

/**
 * One region of the reachability partition, transcribed from the reference generator's four
 * region taxonomies in their own order.
 *
 * Membership is NOT here: a screen points up with `regionId`, so one screen names one region
 * and no list can disagree with the screens themselves. The name is the reference's, because
 * that is the vocabulary the rules are written in.
 */
interface RegionRecord {
  id: RegionId;
  world: Exclude<World, 'both'>;
  type: RegionType;
  name: string;
  /** The overworld area head the game records this region's area events on. */
  headScreenId?: ScreenId;
  /** Set for a dungeon-interior region, naming the dungeon it is a wing of. */
  dungeonId?: DungeonId;
  bounds?: RegionBounds;
  /**
   * A multi-entrance interior the transformed player cannot cross, so everything past it asks
   * for the item that holds the shape (reference `set_bunny_rules`). The flag lives on the
   * region because it is a fact about the place, and the rules read it off the collection
   * instead of carrying a list of names beside them.
   */
  bunnyImpassable?: true;
  review?: ReviewMark;
}

export type { AreaRecord, LocationRecord, RegionBounds, RegionRecord, RegionType };
