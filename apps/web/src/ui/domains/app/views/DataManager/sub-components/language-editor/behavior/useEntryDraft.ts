/* @layer renderer-components @kind hook */
/**
 * Holds the one entry currently being edited, as a draft.
 *
 * Nothing a translator types reaches the stored set until they commit it. That
 * is what makes reading safe: a card is read-only until it is opened, an
 * abandoned edit leaves no trace, and the set is written once per commit rather
 * than once per keystroke — which matters here, because every write also
 * rebakes the asset blobs.
 *
 * Only one entry is open at a time. Opening another while a draft is dirty is
 * refused rather than silently discarding it; the caller decides what to ask.
 */
import { useCallback, useMemo, useState } from 'react';
import type { DialogueEntry, Token } from '@shared/game/language';

type OpenResult = 'opened' | 'blocked-dirty';

type EntryDraftState = {
  /** Entry currently open for editing, if any. */
  openId: number | null;
  /** Working copy of that entry's tokens. */
  tokens: Token[];
  /** The draft differs from what the set holds. */
  dirty: boolean;
  open: (entry: DialogueEntry) => OpenResult;
  /** Abandons the draft, restoring nothing (the set was never touched). */
  cancel: () => void;
  setTokens: (tokens: Token[]) => void;
  /** Writes the draft into the set through the supplied commit callback. */
  commit: () => void;
};

const NO_TOKENS: Token[] = [];

const useEntryDraft = (onCommit: (id: number, tokens: Token[]) => void): EntryDraftState => {
  const [openId, setOpenId] = useState<number | null>(null);
  const [tokens, setDraftTokens] = useState<Token[]>(NO_TOKENS);
  const [original, setOriginal] = useState<Token[]>(NO_TOKENS);

  const dirty = tokens !== original;

  const open = useCallback((entry: DialogueEntry): OpenResult => {
    if (openId !== null && openId !== entry.id && tokens !== original) return 'blocked-dirty';
    setOpenId(entry.id);
    setDraftTokens(entry.tokens);
    setOriginal(entry.tokens);
    return 'opened';
  }, [openId, tokens, original]);

  const cancel = useCallback(() => {
    setOpenId(null);
    setDraftTokens(NO_TOKENS);
    setOriginal(NO_TOKENS);
  }, []);

  const commit = useCallback(() => {
    if (openId === null) return;
    if (tokens !== original) onCommit(openId, tokens);
    setOpenId(null);
    setDraftTokens(NO_TOKENS);
    setOriginal(NO_TOKENS);
  }, [openId, tokens, original, onCommit]);

  return useMemo(
    () => ({ openId, tokens, dirty, open, cancel, setTokens: setDraftTokens, commit }),
    [openId, tokens, dirty, open, cancel, commit],
  );
};

export { useEntryDraft };
export type { EntryDraftState, OpenResult };
