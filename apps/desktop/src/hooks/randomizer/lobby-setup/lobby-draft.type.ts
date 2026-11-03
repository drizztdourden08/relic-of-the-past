/* @layer renderer-lib @kind types */
import type { PatternValue } from '@drizztdourden08/tessera/composites';

type LobbyLocation = 'local' | 'lan' | 'remote';

type LobbyConnect = 'auto' | 'manual';

interface LobbyDraft {
  location: LobbyLocation;
  connect: LobbyConnect;
  lobbyId: string | null;
  address: PatternValue;
  code: PatternValue;
  slotName: string;
  seat: string | null;
}

export type { LobbyConnect, LobbyDraft, LobbyLocation };
