/* @layer bridge-wasm @kind types */
import type { PlayerStatus } from './client-status';
import type { NameTables } from './ap-names';
import type { NetworkFacts } from './network-facts';
import type { Pinger } from './network-ping';
import type { Presence } from './network-presence';
import type { OnlineCore } from './online-core.type';
import type { OnlineRoom } from './online-room';
import type { OnlineSessionConfig } from './online-session-config.type';
import type { RandomizerSession } from './session.type';
import type { TrackerLinks } from './tracker-links.type';

type NetworkState = 'idle' | 'connecting' | 'connected' | 'reconnecting' | 'error';

interface NetworkConnection {
  state: NetworkState;
  configuredUrl: string;
  url: string | null;
  seedName: string | null;
  serverVersion: string | null;
  generatorVersion: string | null;
  slot: number | null;
  slotName: string;
  team: number | null;
  uuidShort: string | null;
  worldVersion: string | null;
  appWorldVersion: string;
  deathLink: boolean;
  passwordUsed: boolean;
  connectedAt: number | null;
  reconnectAttempt: number;
  nextRetryAt: number | null;
  retryInFlight: boolean;
  error: string | null;
}

interface NetworkHealth {
  lastPacketAt: number | null;
  packetsIn: number;
  packetsOut: number;
  pingMs: number | null;
  pingMeanMs: number | null;
  pingSamples: number;
  heldItems: number;
  queuedItems: number;
  receivedIndex: number;
  fileInPlay: boolean;
}

interface NetworkPlayer {
  slot: number;
  name: string;
  alias: string;
  game: string | null;
  online: boolean | null;
  status: PlayerStatus;
  self: boolean;
  checked: number | null;
  total: number | null;
}

type PermissionMode = 'disabled' | 'enabled' | 'goal' | 'auto' | 'auto-enabled' | 'unknown';

interface NetworkPermissions {
  release: PermissionMode;
  collect: PermissionMode;
  remaining: PermissionMode;
}

interface NetworkChecksum {
  game: string;
  matched: boolean;
}

interface NetworkServer {
  permissions: NetworkPermissions | null;
  hintCostPercent: number | null;
  hintCostPoints: number | null;
  hintPoints: number | null;
  locationCheckPoints: number | null;
  games: readonly string[];
  checksums: readonly NetworkChecksum[];
  passwordRequired: boolean | null;
}

interface NetworkProgress {
  checked: number;
  total: number;
  itemsReceived: number;
  itemsSentToOthers: number;
  goalReported: boolean;
}

interface NetworkStatus {
  connection: NetworkConnection;
  health: NetworkHealth;
  players: readonly NetworkPlayer[];
  server: NetworkServer;
  progress: NetworkProgress;
}

type NetworkStatusListener = (status: NetworkStatus) => void;

interface NetworkStatusInput {
  sessionStatus: RandomizerSession['status'];
  config: OnlineSessionConfig;
  facts: NetworkFacts;
  room: OnlineRoom;
  names: NameTables;
  core: Pick<OnlineCore, 'readReceivedIndex' | 'isFileInPlay'>;
  ping: Pick<Pinger, 'lastMs' | 'meanMs' | 'samples'>;
  presence: Pick<Presence, 'onlineOf' | 'statusOf'>;
  trackers: Pick<TrackerLinks, 'progressOf'>;
}

export type {
  NetworkChecksum, NetworkConnection, NetworkHealth, NetworkPermissions, NetworkPlayer, NetworkProgress,
  NetworkServer, NetworkState, NetworkStatus, NetworkStatusInput, NetworkStatusListener, PermissionMode, PlayerStatus,
};
