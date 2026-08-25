/* @layer renderer-components @kind hook */
/**
 * Opening, closing and switching the view of an entry.
 *
 * The two halves are deliberately separate — `useEntryView` knows what is open,
 * `useEntryDraft` knows what is unsaved — and this is the one place that holds
 * both. Entering the editor starts the entry's draft if it has none; leaving it
 * leaves the draft alone, so a card can be read, previewed, closed and reopened
 * with its unsaved words intact. Nothing is ever refused.
 *
 * Committing or cancelling drops the entry back to reading: edit mode with no
 * draft behind it would be a panel with nothing in it, and the reading view is
 * where someone wants to be the moment a line is saved.
 *
 * The handlers close over a live ref rather than the values, so their identity
 * is fixed for the life of the editor. That is what lets the list memoize its
 * few hundred rows: a row re-renders for its own changed facts, not because a
 * keystroke elsewhere re-made every callback.
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
