/* @layer renderer-lib @kind types */
import type { PatternValue } from '@drizztdourden08/tessera/composites';

type LobbyLocation = 'local' | 'lan' | 'remote';

interface LobbyDraft {
  location: LobbyLocation;
  lanId: string | null;
  address: PatternValue;
  code: PatternValue;
  slotName: string;
}

export type { LobbyDraft, LobbyLocation };
