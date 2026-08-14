/* @layer shared-game @kind types */
import type { AreaId, LocationId } from './ids';
import type { World } from '../enumeration/generated-types';

/** A broad geographic zone — a mountain range, a village, a desert. */
interface AreaRecord {
  id: AreaId;
  world: World;
  vanillaName?: string;
  randomizerName: string;
}

/** A named structure or landmark inside exactly one area — a dungeon, a village, a landmark. */
interface LocationRecord {
  id: LocationId;
  areaId: AreaId;
  vanillaName?: string;
  randomizerName: string;
}

export type { AreaRecord, LocationRecord };
