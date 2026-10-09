/* @layer renderer-components @kind types */
import type { DialogueEntry, Token } from '@shared/game/language';

type Draft = { tokens: Token[]; original: Token[] };

type EntryDraftState = {
  tokensOf: (id: number) => Token[] | null;
  isDirty: (id: number) => boolean;
  open: (entry: DialogueEntry) => void;
  setTokens: (id: number, tokens: Token[]) => void;
  commit: (id: number) => void;
  cancel: (id: number) => void;
};

export type { Draft, EntryDraftState };
