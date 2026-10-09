/* @layer bridge-wasm @kind types */
import type { ApRoomUpdatePacket } from '../ap-protocol.type';

interface NetworkFacts {
  url: string | null;
  seedName: string | null;
  serverVersion: string | null;
  generatorVersion: string | null;
  games: string[];
  roomChecksums: Record<string, string>;
  passwordRequired: boolean | null;
  permissions: Record<string, number> | null;
  hintCostPercent: number | null;
  locationCheckPoints: number | null;
  hintPoints: number | null;
  uuid: string | null;
  deathLink: boolean;
  worldVersion: string | null;
  connectedAt: number | null;
  lastPacketAt: number | null;
  packetsIn: number;
  packetsOut: number;
  requestedGames: Set<string>;
  fetchedChecksums: Map<string, string | undefined>;
  itemsReceived: number;
  scoutOwners: Map<number, number>;
  sentChecks: Set<number>;
  goalReported: boolean;
  reconnectAttempt: number;
  nextRetryAt: number | null;
  retryInFlight: boolean;
  error: string | null;
}

type RoomSettings = Pick<ApRoomUpdatePacket, 'permissions' | 'hint_cost' | 'location_check_points' | 'hint_points'>;

export type { NetworkFacts, RoomSettings };
