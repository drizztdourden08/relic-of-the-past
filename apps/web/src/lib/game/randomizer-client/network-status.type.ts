/* @layer bridge-wasm @kind types */
/**
 * The online session's network picture, one snapshot at a time (network-status.ts builds it).
 * Times are epoch ms, so a reader works out an age or a countdown against its own clock.
 */
import type { PlayerStatus } from './client-status';

type NetworkState = 'idle' | 'connecting' | 'connected' | 'reconnecting' | 'error';

interface NetworkConnection {
  state: NetworkState;
  /** The address as the profile holds it. */
  configuredUrl: string;
  /** The candidate that opened (server-url.ts); null until one did. */
  url: string | null;
  seedName: string | null;
  serverVersion: string | null;
  generatorVersion: string | null;
  slot: number | null;
  slotName: string;
  team: number | null;
  /** The first block of the install's client id. */
  uuidShort: string | null;
  /** The world package version the slot was generated with; null until Connected. */
  worldVersion: string | null;
  /** The version this app speaks (AP_WORLD_VERSION). */
  appWorldVersion: string;
  deathLink: boolean;
  passwordUsed: boolean;
  /** When the slot was accepted on the live connection; null while not connected. */
  connectedAt: number | null;
  /** Tries since the last drop; 0 while connected. */
  reconnectAttempt: number;
  /** When the next try runs, while reconnecting and waiting for it; null while a try is in flight. */
  nextRetryAt: number | null;
  /** A try is under way while reconnecting: its socket is opening or its slot is being accepted. */
  retryInFlight: boolean;
  /** Why the session ended in error, or why the server was never reached while retrying. */
  error: string | null;
}

interface NetworkHealth {
  lastPacketAt: number | null;
  packetsIn: number;
  packetsOut: number;
  /** The last round trip, in ms. */
  pingMs: number | null;
  /** The mean of the last PING_WINDOW round trips. */
  pingMeanMs: number | null;
  pingSamples: number;
  /** Items the server sent before the scouts were armed, waiting for them. */
  heldItems: number;
  /** Items handed to the game and not granted yet. */
  queuedItems: number;
  /** How many of the server's items the save holds. */
  receivedIndex: number;
  fileInPlay: boolean;
}

interface NetworkPlayer {
  slot: number;
  name: string;
  alias: string;
  game: string | null;
  /** null: the room has not said (neither `!players` nor a join, part or client status). */
  online: boolean | null;
  /** The slot's client status; a status that needs a client reads unknown while offline. */
  status: PlayerStatus;
  self: boolean;
  /** Another slot's counts come from a tracker link; null while none is connected. */
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
  /** A hint's price for this slot, worked out as the server does. */
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

export type {
  NetworkChecksum, NetworkConnection, NetworkHealth, NetworkPermissions, NetworkPlayer, NetworkProgress,
  NetworkServer, NetworkState, NetworkStatus, NetworkStatusListener, PermissionMode, PlayerStatus,
};
