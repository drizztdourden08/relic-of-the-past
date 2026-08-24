/* @layer renderer-components @kind hook */
/**
 * Unsaved edits, one draft per entry.
 *
 * Nothing a translator types reaches the stored set until they commit it: the
 * set is written once per commit rather than once per keystroke (every write
 * also rebakes the asset blobs), and an abandoned edit leaves no trace.
 *
 * A draft belongs to its entry and stays until that entry is saved or
 * cancelled — switching the card to reading or preview, opening another entry,
 * or closing the card never touches it. Every other view of an entry that holds
 * a draft shows the DRAFT, so what the preview draws is what will be saved. No
 * request here is ever refused: an Edit button that does nothing is a bug, not
 * a policy.
 */
import { useCallback, useMemo, useState } from 'react';
import type { DialogueEntry, Token } from '@shared/game/language';

type Draft = { tokens: Token[]; original: Token[] };

type EntryDraftState = {
  /** The entry's unsaved tokens, or null when it has no draft. */
  tokensOf: (id: number) => Token[] | null;
  /** The draft differs from what the set holds. */
  isDirty: (id: number) => boolean;
  /** Starts a draft from the entry's stored tokens; a no-op when one exists. */
  open: (entry: DialogueEntry) => void;
  setTokens: (id: number, tokens: Token[]) => void;
  /** Writes the draft into the set through the supplied commit callback. */
  commit: (id: number) => void;
  /** Drops the draft, restoring nothing (the set was never touched). */
  cancel: (id: number) => void;
};

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
export type { EntryDraftState };
