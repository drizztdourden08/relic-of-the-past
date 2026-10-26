/* @layer bridge-wasm @kind types */
import type { LobbySession } from '@rotp/randomizer';

interface Watched {
  session: LobbySession;
  stop: () => void;
}

export type { Watched };
