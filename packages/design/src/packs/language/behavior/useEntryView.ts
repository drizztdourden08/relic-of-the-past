/* @layer renderer-components @kind hook */
import { useCallback, useMemo, useState } from 'react';
import { DEFAULT_MODE } from './language-behavior.constants';
import type { EntryViewMode, EntryViewState } from './language-behavior.type';

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
export type { EntryViewMode, EntryViewState } from './language-behavior.type';
