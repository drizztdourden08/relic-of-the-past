/* @layer shared-game @kind types */
import type { ActorId, AreaId, LocationId, RegionId, ScreenId, TagId } from '../ids';
import type { RegionBounds } from '../region';
import type { ReviewMark } from '../review';
import type { RegionNavData } from '../../../navigation/nav-data.types';
import type { InteriorKind, ScreenKind, World } from '../../enumeration/generated-types';

type ScreenWorld = Exclude<World, 'both'>;

interface ScreenGameId {
  overworldIndex?: number;
  roomIndex?: number;
  palaceIndex?: number;
  entranceId?: number;
}

interface ScreenPosition {
  gridX: number;
  gridY: number;
  floor?: number;
}

type VariantCondition =
  | { type: 'flag'; address: number; bit: number; value: boolean }
  | { type: 'check'; id: string; collected: boolean }
  | { type: 'entrance'; id: number }
  | { type: 'progress'; min?: number; max?: number }
  | { type: 'always' };

interface ScreenVariantInfo {
  key: string;
  label?: string;
  progressTier?: number | [number, number];
  condition: VariantCondition;
}

interface ScreenSpawn {
  actorId: ActorId;
  tile: { x: number; y: number };
}

interface ScreenRecord {
  id: ScreenId;
  gameId: ScreenGameId;
  kind: ScreenKind;
  world: ScreenWorld;
  interiorKind?: InteriorKind;
  name: string;
  areaId: AreaId;
  locationId: LocationId;
  regionId?: RegionId;
  bounds?: RegionBounds;
  position?: ScreenPosition;
  tags: readonly TagId[];
  variant?: ScreenVariantInfo;
  nav?: RegionNavData;
  triggerIds?: readonly ActorId[];
  spawns?: readonly ScreenSpawn[];
  review?: ReviewMark;
}

export type {
  InteriorKind,
  ScreenGameId,
  ScreenKind,
  ScreenPosition,
  ScreenRecord,
  ScreenSpawn,
  ScreenVariantInfo,
  ScreenWorld,
  VariantCondition,
  World,
};
