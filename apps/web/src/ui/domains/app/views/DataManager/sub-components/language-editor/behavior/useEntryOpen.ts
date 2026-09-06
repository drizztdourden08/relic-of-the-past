/* @layer renderer-components @kind hook */
/**
 * The one place that holds both `useEntryView` (what is open) and
 * `useEntryDraft` (what is unsaved). Entering the editor starts a draft if
 * none exists; leaving it keeps the draft. Commit and cancel drop the entry
 * back to reading. The handlers close over a live ref, so their identity is
 * fixed and the list can memoize its few hundred rows.
 */
import { useCallback, useMemo, useRef } from 'react';
import { useEntryDraft } from './useEntryDraft';
import { useEntryView } from './useEntryView';
import type { DialogueEntry, Token } from '@shared/game/language';
import type { EntryDraftState } from './useEntryDraft';
import type { EntryViewMode, EntryViewState } from './useEntryView';

type EntryOpenState = {
  view: EntryViewState;
  /** The drafts, with commit and cancel also returning the entry to reading. */
  draft: EntryDraftState;
  open: (id: number) => void;
  close: (id: number) => void;
  setMode: (id: number, mode: EntryViewMode) => void;
};

const useEntryOpen = (
  entries: DialogueEntry[],
  onCommit: (id: number, tokens: Token[]) => void,
): EntryOpenState => {
  const view = useEntryView();
  const draft = useEntryDraft(onCommit);

  const live = useRef({ entries, view, draft });
  live.current = { entries, view, draft };

  const open = useCallback((id: number) => {
    live.current.view.open(id);
  }, []);

  const close = useCallback((id: number) => {
    live.current.view.close(id);
  }, []);

  const setMode = useCallback((id: number, mode: EntryViewMode) => {
    const { entries: all, view: shown, draft: current } = live.current;
    if (mode === 'edit') {
      const entry = all.find((candidate) => candidate.id === id);
      if (entry !== undefined) current.open(entry);
    }
    shown.setMode(id, mode);
  }, []);

  const commit = useCallback((id: number) => {
    live.current.draft.commit(id);
    live.current.view.setMode(id, 'read');
  }, []);

  const cancel = useCallback((id: number) => {
    live.current.draft.cancel(id);
    live.current.view.setMode(id, 'read');
  }, []);

  const wrapped = useMemo<EntryDraftState>(
    () => ({ ...draft, commit, cancel }),
    [draft, commit, cancel],
  );

  return useMemo(
    () => ({ view, draft: wrapped, open, close, setMode }),
    [view, wrapped, open, close, setMode],
  );
};

export { useEntryOpen };
export type { EntryOpenState };
