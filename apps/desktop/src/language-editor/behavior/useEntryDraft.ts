/* @layer renderer-components @kind hook */
import { useCallback, useMemo, useState } from 'react';
import type { DialogueEntry, Token } from '@rotp/languages';
import type { Draft, EntryDraftState } from './entry-draft.type';

const useEntryDraft = (onCommit: (id: number, tokens: Token[]) => void): EntryDraftState => {
  const [drafts, setDrafts] = useState<ReadonlyMap<number, Draft>>(() => new Map());

  const tokensOf = useCallback((id: number) => drafts.get(id)?.tokens ?? null, [drafts]);

  const isDirty = useCallback((id: number) => {
    const draft = drafts.get(id);
    return draft !== undefined && draft.tokens !== draft.original;
  }, [drafts]);

  const open = useCallback((entry: DialogueEntry) => {
    setDrafts((current) => {
      if (current.has(entry.id)) return current;
      const next = new Map(current);
      next.set(entry.id, { tokens: entry.tokens, original: entry.tokens });
      return next;
    });
  }, []);

  const setTokens = useCallback((id: number, tokens: Token[]) => {
    setDrafts((current) => {
      const draft = current.get(id);
      if (draft === undefined || draft.tokens === tokens) return current;
      const next = new Map(current);
      next.set(id, { ...draft, tokens });
      return next;
    });
  }, []);

  const drop = useCallback((id: number) => {
    setDrafts((current) => {
      if (!current.has(id)) return current;
      const next = new Map(current);
      next.delete(id);
      return next;
    });
  }, []);

  const commit = useCallback((id: number) => {
    const draft = drafts.get(id);
    if (draft === undefined) return;
    if (draft.tokens !== draft.original) onCommit(id, draft.tokens);
    drop(id);
  }, [drafts, onCommit, drop]);

  return useMemo(
    () => ({ tokensOf, isDirty, open, setTokens, commit, cancel: drop }),
    [tokensOf, isDirty, open, setTokens, commit, drop],
  );
};

export { useEntryDraft };
