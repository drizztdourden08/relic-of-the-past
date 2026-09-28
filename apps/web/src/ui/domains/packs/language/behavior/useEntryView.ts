/* @layer renderer-components @kind hook */
/**
 * Which entries are open, and which view each shows. Openness is per entry,
 * not one at a time, so two lines can be compared. The mode is per entry too,
 * remembered while open, and defaults to reading. Nothing here knows about
 * drafts; that is `useEntryDraft`'s business.
 */
import { useCallback, useMemo, useState } from 'react';

/** The three ways one entry can be shown once it is open. */
type EntryViewMode = 'read' | 'edit' | 'preview';

const DEFAULT_MODE: EntryViewMode = 'read';

type EntryViewState = {
  /** True when this entry's panel is showing. */
  isOpen: (id: number) => boolean;
  /** The view this entry is showing; reading, until it is told otherwise. */
  modeOf: (id: number) => EntryViewMode;
  open: (id: number) => void;
  close: (id: number) => void;
  setMode: (id: number, mode: EntryViewMode) => void;
};

const useEntryView = (): EntryViewState => {
  const [openIds, setOpenIds] = useState<ReadonlySet<number>>(() => new Set<number>());
  const [modes, setModes] = useState<ReadonlyMap<number, EntryViewMode>>(
    () => new Map<number, EntryViewMode>(),
  );

  const isOpen = useCallback((id: number) => openIds.has(id), [openIds]);
  const modeOf = useCallback(
    (id: number) => modes.get(id) ?? DEFAULT_MODE,
    [modes],
  );

  const open = useCallback((id: number) => {
    setOpenIds((current) => {
      if (current.has(id)) return current;
      const next = new Set(current);
      next.add(id);
      return next;
    });
  }, []);

  /** Closing forgets the mode: a row reopened later opens for reading again. */
  const close = useCallback((id: number) => {
    setOpenIds((current) => {
      if (!current.has(id)) return current;
      const next = new Set(current);
      next.delete(id);
      return next;
    });
    setModes((current) => {
      if (!current.has(id)) return current;
      const next = new Map(current);
      next.delete(id);
      return next;
    });
  }, []);

  const setMode = useCallback((id: number, mode: EntryViewMode) => {
    setModes((current) => {
      if (current.get(id) === mode) return current;
      const next = new Map(current);
      next.set(id, mode);
      return next;
    });
  }, []);

  return useMemo(
    () => ({ isOpen, modeOf, open, close, setMode }),
    [isOpen, modeOf, open, close, setMode],
  );
};

export { useEntryView };
export type { EntryViewMode, EntryViewState };
