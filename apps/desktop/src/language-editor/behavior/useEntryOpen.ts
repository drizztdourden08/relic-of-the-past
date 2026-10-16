/* @layer renderer-components @kind hook */
import { useCallback, useMemo, useRef, useState } from 'react';
import { useEntryDraft } from './useEntryDraft';
import { useEntryView } from '@rotp/design/packs';
import type { DialogueEntry, Token } from '@rotp/languages';
import type { EntryDraftState } from './entry-draft.type';
import type { EntryViewMode } from '@rotp/design/packs';
import type { EntryOpenState } from './entry-open.type';

const useEntryOpen = (
  entries: DialogueEntry[],
  onCommit: (id: number, tokens: Token[]) => void,
): EntryOpenState => {
  const view = useEntryView();
  const draft = useEntryDraft(onCommit);
  const [selected, setSelected] = useState<number | null>(null);

  const live = useRef({ entries, view, draft });
  live.current = { entries, view, draft };

  const open = useCallback((id: number) => {
    live.current.view.open(id);
    setSelected(id);
  }, []);

  const close = useCallback((id: number) => {
    live.current.view.close(id);
    setSelected((current) => (current === id ? null : current));
  }, []);

  const setMode = useCallback((id: number, mode: EntryViewMode) => {
    const { entries: all, view: shown, draft: current } = live.current;
    if (mode === 'edit') {
      const entry = all.find((candidate) => candidate.id === id);
      if (entry !== undefined) current.open(entry);
    }
    shown.setMode(id, mode);
    setSelected(id);
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
    () => ({ view, draft: wrapped, selected, open, close, setMode }),
    [view, wrapped, selected, open, close, setMode],
  );
};

export { useEntryOpen };
