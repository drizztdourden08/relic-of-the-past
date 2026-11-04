/* @layer shared-game @kind types */
import type {
  Exit as WorldExit, Region as BaseRegion, WorldEvent as BaseWorldEvent, WorldLocation as BaseWorldLocation,
} from '@drizztdourden08/brock-randomizer/world';
import type { ConnectionId, DungeonId, ItemId, RegionId, ConnectionKind, RegionType } from '@rotp/game-data';
import type { RotpKeys } from './rotp-keys.type';

interface RegionGraphRow {
  from: RegionId;
  to: RegionId;
  exit: string;
  connectionId?: ConnectionId;
}

interface WorldLocation extends BaseWorldLocation<RotpKeys> {
  kdsOnly: boolean;
  capacityOnly: boolean;
  pondSlot: boolean;
  prize: boolean;
  vanillaItem?: ItemId;
}

type WorldEvent = BaseWorldEvent<RotpKeys>;

type Exit = WorldExit<RotpKeys>;

interface Region extends BaseRegion<RotpKeys> {
  type: RegionType;
  locations: WorldLocation[];
  isLightWorld: boolean;
  isDarkWorld: boolean;
}

interface WorldDungeon {
  id: DungeonId;
  name: string;
  regions: readonly RegionId[];
  bigKey: ItemId | null;
  smallKey: ItemId;
  smallKeyCount: number;
  map: ItemId | null;
  compass: ItemId | null;
}

interface RegionCrossing {
  connectionId: ConnectionId;
  from: RegionId;
  to: RegionId;
  kind: ConnectionKind;
}

export type {
  RegionCrossing,
  RegionGraphRow,
  WorldLocation,
  WorldEvent,
  Exit,
  Region,
  WorldDungeon,
};
