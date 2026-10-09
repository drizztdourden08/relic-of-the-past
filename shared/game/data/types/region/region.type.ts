/* @layer shared-game @kind types */
import type { AreaId, DungeonId, LocationId, RegionId, ScreenId } from '../ids';
import type { World } from '../../enumeration/generated-types';
import type { ReviewMark } from '../review';

interface AreaRecord {
  id: AreaId;
  world: World;
  name: string;
  review?: ReviewMark;
}

interface LocationRecord {
  id: LocationId;
  areaId: AreaId;
  name: string;
  review?: ReviewMark;
}

type RegionType = 'light' | 'dark' | 'cave' | 'dungeon';

interface RegionBounds {
  screenId: ScreenId;
  x0: number;
  x1: number;
  y0: number;
  y1: number;
}

interface RegionRecord {
  id: RegionId;
  world: Exclude<World, 'both'>;
  type: RegionType;
  name: string;
  headScreenId?: ScreenId;
  dungeonId?: DungeonId;
  bounds?: RegionBounds;
  bunnyImpassable?: true;
  review?: ReviewMark;
}

export type { AreaRecord, LocationRecord, RegionBounds, RegionRecord, RegionType };
