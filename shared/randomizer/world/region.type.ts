/* @layer shared-game @kind types */
import type { CheckId, ConnectionId, DungeonId, ItemId, RegionId } from '@shared/game/data/types/ids';
import type { ConnectionKind } from '@shared/game/data/types';
import type { RegionType } from '@shared/game/data/types/region';
import type { LocationKey } from './location-key.type';

interface RegionGraphRow {
  from: RegionId;
  to: RegionId;
  exit: string;
  connectionId?: ConnectionId;
}

interface WorldLocation {
  key: LocationKey;
  region: RegionId;
  kdsOnly: boolean;
  capacityOnly: boolean;
  pondSlot: boolean;
  prize: boolean;
  vanillaItem?: ItemId;
}

interface WorldEvent {
  key: CheckId;
  region: RegionId;
}

interface Exit {
  name: string;
  source: RegionId;
  target: RegionId;
}

interface Region {
  id: RegionId;
  name: string;
  type: RegionType;
  locations: WorldLocation[];
  events: WorldEvent[];
  exits: Exit[];
  entrances: Exit[];
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
