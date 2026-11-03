/* @layer bridge-wasm @kind types */
import type { HeldSeat, OpenSeats } from '@rotp/randomizer';
import type { WorldPackageBuild } from '@app/archipelago/world-package';

interface LobbyCheckOk {
  kind: 'ok';
  server: string;
  code: string;
  name: string;
  ap: string;
  approval: boolean;
  seats: readonly HeldSeat[];
  open?: OpenSeats;
  build: WorldPackageBuild;
}

type LobbyCheck =
  | { kind: 'idle' }
  | { kind: 'checking' }
  | LobbyCheckOk
  | { kind: 'error'; text: string; code?: string };

export type { LobbyCheck, LobbyCheckOk };
