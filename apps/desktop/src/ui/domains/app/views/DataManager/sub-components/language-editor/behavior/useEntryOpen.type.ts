/* @layer renderer-components @kind types */
import type { EntryViewMode, EntryViewState } from '@rotp/design/packs';
import type { EntryDraftState } from './useEntryDraft.type';

type EntryOpenState = {
  view: EntryViewState;
  draft: EntryDraftState;
  open: (id: number) => void;
  close: (id: number) => void;
  setMode: (id: number, mode: EntryViewMode) => void;
};

export type { EntryOpenState };
