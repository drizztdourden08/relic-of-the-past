/* @layer renderer-lib @kind types */
import type { LobbyRef } from '@rotp/randomizer';
import type { LobbyDraft } from './lobby-draft.type';

type RefStrategy = (draft: LobbyDraft) => LobbyRef | null;

export type { RefStrategy };
