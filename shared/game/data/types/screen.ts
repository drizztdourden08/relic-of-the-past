/* @layer shared-game @kind types */
import type { ActorId, AreaId, LocationId, ScreenId, TagId } from './ids';
import type { RegionNavData } from '../../navigation/nav-data.types';
import type { InteriorKind, ScreenKind, ScreenStatus, World } from '../enumeration/generated-types';

/** A screen only ever sits in one world — `'both'` is an area-level concept (e.g. Death Mountain). */
type ScreenWorld = Exclude<World, 'both'>;

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
  world: ScreenWorld;
  interiorKind?: InteriorKind;
  /** Only set when a real in-game/guide term exists — see the naming policy. */
  vanillaName?: string;
  /** Always present — today's `name`, already ALTTPR-styled. */
  randomizerName: string;
  areaId: AreaId;
  locationId: LocationId;
  position?: ScreenPosition;
  /** References into the tag collection — read the terms back with `tagKeysOf`. */
  tags: readonly TagId[];
  variant?: ScreenVariantInfo;
  status: ScreenStatus;
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
  ScreenStatus,
  ScreenVariantInfo,
  ScreenWorld,
  VariantCondition,
  World,
};
