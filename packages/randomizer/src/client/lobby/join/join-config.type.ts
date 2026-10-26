/* @layer bridge-wasm @kind types */
import type { ClientInfo } from '@drizztdourden08/archipelia-lobby-protocol';
import type { CreateSocket } from '../../ap-socket.type';

type WorldInput = {
  worldVersion: string;
  bytes: Uint8Array;
  sha256: string;
  size: number;
  bundle?: Record<string, unknown>;
  game?: string;
  module?: string;
};

type SlotInput = { name: string; yaml: string; game?: string };

type SlotsUpdate = { slots: SlotInput[]; world?: WorldInput };

type JoinConfig = {
  server: string;
  code: string;
  client: ClientInfo;
  archipelagoVersion: string;
  world: WorldInput;
  slots: SlotInput[];
  displayName?: string;
  token?: string | null;
  preflight?: boolean;
  autoReady?: boolean;
  autoUpload?: boolean;
  protocolVersions?: number[];
  capabilities?: string[];
};

type JoinDeps = {
  createSocket?: CreateSocket;
  maxReconnects?: number;
};

export type { JoinConfig, JoinDeps, SlotInput, SlotsUpdate, WorldInput };
