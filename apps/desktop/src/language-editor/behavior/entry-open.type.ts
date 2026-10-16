/* @layer renderer-components @kind types */
import type { EntryViewMode, EntryViewState } from '@rotp/design/packs';
import type { EntryDraftState } from './entry-draft.type';

type EntryOpenState = {
  view: EntryViewState;
  draft: EntryDraftState;
  selected: number | null;
  open: (id: number) => void;
  close: (id: number) => void;
  setMode: (id: number, mode: EntryViewMode) => void;
};

export type { EntryOpenState };
