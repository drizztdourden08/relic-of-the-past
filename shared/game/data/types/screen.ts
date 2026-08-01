/* @layer shared-game @kind types */
import type { ActorId, AreaId, LocationId, ScreenId } from './ids';
import type { ScreenTag } from '../taxonomy/screen-tags';
import type { RegionNavData } from '../../navigation/nav-data.types';

type ScreenKind = 'overworld' | 'dungeon' | 'interior';
type World = 'light' | 'dark';
type InteriorKind = 'house' | 'cave' | 'shop' | 'fairy' | 'well' | 'passage' | 'hint' | 'gamble' | 'special';

interface ScreenGameId {
  /** Native OW screen index (0x00-0x3F per world). */
  overworldIndex?: number;
  /** Native dungeon/interior room index. */
  roomIndex?: number;
  /** Runtime cur_palace_index_x2 — the canonical dungeon identifier. */
  palaceIndex?: number;
  /** RAM $010E — disambiguates shared room indices. */
  entranceId?: number;
}

/** Unifies the old overworld.gridX/gridY and dungeon.gridX/gridY into one shape. */
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

/** One static actor spawn on a screen, at a base-tile position. */
interface ScreenSpawn {
  actorId: ActorId;
  tile: { x: number; y: number };
}

interface ScreenRecord {
  id: ScreenId;
  gameId: ScreenGameId;
  kind: ScreenKind;
  world: World;
  interiorKind?: InteriorKind;
  /** Only set when a real in-game/guide term exists — see the naming policy. */
  vanillaName?: string;
  /** Always present — today's `name`, already ALTTPR-styled. */
  randomizerName: string;
  areaId: AreaId;
  locationId: LocationId;
  position?: ScreenPosition;
  tags: readonly ScreenTag[];
  variant?: ScreenVariantInfo;
  status: 'draft' | 'mapped' | 'verified';
  /** Pre-computed flood-fill navigation facts — tile counts, obstacles, connection points. */
  nav?: RegionNavData;
  /**
   * The room's active tag mechanics — shutters, kill-rooms, switch doors —
   * from the room header's tag bytes, joined to trigger actors by roomTag.
   */
  triggerIds?: readonly ActorId[];
  /** The room's static actor spawns, from the per-room sprite table. */
  spawns?: readonly ScreenSpawn[];
}

export type {
  InteriorKind,
  ScreenGameId,
  ScreenKind,
  ScreenPosition,
  ScreenRecord,
  ScreenSpawn,
  ScreenVariantInfo,
  VariantCondition,
  World,
};
