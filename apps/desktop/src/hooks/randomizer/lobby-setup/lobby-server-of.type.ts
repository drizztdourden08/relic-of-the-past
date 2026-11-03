/* @layer renderer-lib @kind types */
import type { LanServer } from '@rotp/randomizer';
import type { LobbyDraft } from './lobby-draft.type';

type ServerStrategy = (draft: LobbyDraft, servers: readonly LanServer[]) => string | null;

export type { ServerStrategy };
