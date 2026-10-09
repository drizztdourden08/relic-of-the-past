/* @layer renderer-widgets @kind types */
import type { PendingScreenRecord } from '@rotp/game-data';
import type { AreaId, AreaRecord, DungeonId, LocationId, LocationRecord, ScreenRecord, ScreenTag, ScreenWorld } from '@rotp/game-data';
import type { Allocated } from '@shared/ipc/screen-editor-contract';

type AllocatedArea = Allocated<AreaRecord>;
type AllocatedLocation = Allocated<LocationRecord>;

type Allocation<T> = { record: T } | { error: string };

interface ScreenDraft {
  kind: ScreenRecord['kind'];
  world: ScreenRecord['world'];
  interiorKind: ScreenRecord['interiorKind'];
  name: string;
  areaId: ScreenRecord['areaId'] | '';
  locationId: ScreenRecord['locationId'] | '';
  tags: readonly ScreenTag[];
  variant: ScreenRecord['variant'];
  roomIndex: number;
  overworldIndex: number;
  palaceIndex: number | undefined;
  entranceId: number | undefined;
  gridX: number | undefined;
  gridY: number | undefined;
  floor: number | undefined;
  existing: ScreenRecord | null;
}

interface DraftResult {
  record: PendingScreenRecord | null;
  blockers: string[];
}

interface DungeonGeography {
  dungeonId: DungeonId;
  name: string;
  areaId: AreaId;
  locationId: LocationId;
  world: ScreenWorld;
}

export type { AllocatedArea, AllocatedLocation, Allocation, DraftResult, DungeonGeography, ScreenDraft };
