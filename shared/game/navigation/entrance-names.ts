/**
 * Entrance name and type classification derived from region/connection data.
 * Keyed by room ID (from wasmGetEntranceRooms), not entrance index.
 */
import { ALL_REGIONS, REGION_BY_ID } from '../data/regions';
import { ALL_CONNECTIONS } from '../data/connections';

export type EntranceType = 'door' | 'cave' | 'hole' | 'well' | 'dungeon' | 'fairy' | 'shop' | 'house' | 'unknown';

// Build room ID → region lookup for caves/dungeons
const regionByRoom = new Map<number, typeof ALL_REGIONS[number]>(
  ALL_REGIONS
    .filter(r => r.inGameIndex != null && (r.type === 'cave' || r.type === 'dungeon'))
    .map(r => [r.inGameIndex!, r])
);

// Build region ID → connection entrance name
const entranceNameByRegionId = new Map<string, string>(
  ALL_CONNECTIONS.map(c => [c.to, c.entrance])
);

// Build ENTRANCE_NAMES keyed by room ID
const nameMap: Record<number, string> = {};
for (const [roomId, region] of regionByRoom) {
  const name = entranceNameByRegionId.get(region.id) ?? region.name;
  nameMap[roomId] = name;
}

export const ENTRANCE_NAMES: Readonly<Record<number, string>> = nameMap;

export function classifyEntrance(roomId: number): EntranceType {
  const region = regionByRoom.get(roomId);
  if (!region) return 'unknown';
  const tags = region.tags as readonly string[];
  if (tags.some(t => t === 'type:dungeon')) return 'dungeon';
  if (tags.some(t => t === 'type:shop')) return 'shop';
  if (tags.some(t => t === 'type:fairy')) return 'fairy';
  if (tags.some(t => t === 'type:house')) return 'house';
  if (tags.some(t => t === 'type:well')) return 'well';
  if (tags.some(t => t === 'type:cave')) return 'cave';
  return 'door';
}
