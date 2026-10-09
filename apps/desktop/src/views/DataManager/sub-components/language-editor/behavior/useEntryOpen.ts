/* @layer renderer-components @kind hook */
import { useCallback, useMemo, useRef } from 'react';
import { useEntryDraft } from './useEntryDraft';
import { useEntryView } from '@rotp/design/packs';
import type { DialogueEntry, Token } from '@rotp/languages';
import type { EntryDraftState } from './useEntryDraft.type';
import type { EntryViewMode } from '@rotp/design/packs';
import type { EntryOpenState } from './useEntryOpen.type';

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
