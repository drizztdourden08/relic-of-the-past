/* @layer tests @kind type */
import type { ArchipelagoSession, ConnectionState, NetworkStatus, RoomMessage } from '@drizztdourden08/brock-randomizer/archipelago';

type HarnessStatus = 'idle' | 'connecting' | 'active' | 'reconnecting' | 'error';

interface HarnessConfig {
  url: string;
  slotName: string;
  password?: string | undefined;
  deathLink?: boolean;
  trackOtherPlayers?: boolean;
}

interface HarnessNetwork extends Omit<NetworkStatus, 'connection'> {
  connection: { state: ConnectionState; error: string | null };
}

interface HarnessSession {
  client: ArchipelagoSession;
  readonly status: HarnessStatus;
  readonly messages: readonly RoomMessage[];
  readonly placement: unknown;
  readonly networkStatus: HarnessNetwork;
  start(): Promise<void>;
  stop(): void;
}

export type { HarnessConfig, HarnessNetwork, HarnessSession, HarnessStatus };
