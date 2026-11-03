/* @layer renderer-lib @kind types */
import type { LobbyDraft } from './lobby-draft.type';

type ServerStrategy = (draft: LobbyDraft) => string | null;

export type { ServerStrategy };
