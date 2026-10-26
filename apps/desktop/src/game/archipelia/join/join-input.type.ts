/* @layer bridge-wasm @kind types */
import type { LobbyClientInfo as ClientInfo } from '@rotp/randomizer';
import type { LobbySession } from '@rotp/randomizer';
import type { WorldPackageBuild } from '@app/archipelago/world-package';
import type { ProfileRandomizerConfig } from '@app/profiles/types';
import type { ArchipeliaMembership } from '../membership/membership.type';

interface JoinInput {
  server: string;
  code: string;
  ap: string;
  slotName: string;
  yaml: string;
  build: WorldPackageBuild;
  bytes: Uint8Array;
  client: ClientInfo;
  token?: string;
}

interface StartJoinInput {
  server: string;
  code: string;
  ap: string;
  config: ProfileRandomizerConfig;
  token?: string;
}

type JoinOutcome =
  | { ok: true; session: LobbySession; membership: ArchipeliaMembership }
  | { ok: false; error: string };

type StartJoinResult = { session: LobbySession } | { error: string };

export type { JoinInput, JoinOutcome, StartJoinInput, StartJoinResult };
