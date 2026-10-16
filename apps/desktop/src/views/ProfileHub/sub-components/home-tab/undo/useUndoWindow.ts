/* @layer renderer-components @kind hook */
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { UNDO_WINDOW_MS } from '../home-tab.constants';
import { runQuietly } from './run-quietly';
import type { LiveUndo, UndoNotices, UndoOffer, UndoWindow } from './undo.type';

const useUndoWindow = (): UndoWindow => {
  const [notices, setNotices] = useState<UndoNotices>({});
  const live = useRef(new Map<string, LiveUndo>());

  const take = useCallback((key: string): LiveUndo | undefined => {
    const entry = live.current.get(key);
    if (entry) clearTimeout(entry.timer);
    live.current.delete(key);
    return entry;
  }, []);

  const clearNotice = useCallback((key: string) => setNotices((current) => (
    live.current.has(key) ? current : Object.fromEntries(Object.entries(current).filter(([k]) => k !== key))
  )), []);

  const finish = useCallback(async (key: string) => {
    const entry = take(key);
    if (!entry) return;
    await runQuietly(entry.commit, 'finish the change');
    clearNotice(key);
  }, [take, clearNotice]);

  const offer = useCallback((next: UndoOffer) => {
    const { key, kind } = next;
    for (const [other, entry] of [...live.current]) {
      if (other === key || (kind === 'loaded' && entry.kind === 'loaded')) void finish(other);
    }
    live.current.set(key, { ...next, timer: setTimeout(() => void finish(key), UNDO_WINDOW_MS) });
    setNotices((current) => ({ ...current, [key]: kind }));
  }, [finish]);

  const undo = useCallback((key: string) => {
    const entry = take(key);
    clearNotice(key);
    void runQuietly(entry?.undo, 'undo the change');
  }, [take, clearNotice]);

  const undoLatest = useCallback(() => {
    const latest = [...live.current.keys()].pop();
    if (latest !== undefined) undo(latest);
  }, [undo]);

  useEffect(() => {
    const entries = live.current;
    return () => {
      for (const entry of entries.values()) {
        clearTimeout(entry.timer);
        void runQuietly(entry.commit, 'finish the change');
      }
      entries.clear();
    };
  }, []);

  return useMemo(() => ({ notices, offer, undo, undoLatest }), [notices, offer, undo, undoLatest]);
};

export { useUndoWindow };
