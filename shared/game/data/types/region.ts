/* @layer shared-game @kind types */
import type { AreaId, LocationId } from './ids';

/** A broad geographic zone — "Death Mountain", "Kakariko", "the desert". */
interface AreaRecord {
  id: AreaId;
  world: 'light' | 'dark' | 'both';
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
