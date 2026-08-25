/* @layer renderer-widgets @kind logic */
/**
 * Line-level selection over the log list: click selects one line, ctrl/cmd-click toggles,
 * shift-click extends from the last anchor. The unit is always a whole entry — the widget's
 * rows are flex components, so browser text selection cannot cross them; this replaces it.
 */
import { useCallback, useRef, useState } from 'react';
import type { LogEntry } from '../../../../../lib/log-bus';

const useLogSelection = (entries: LogEntry[]) => {
  const [selected, setSelected] = useState<ReadonlySet<number>>(new Set());
  const anchorRef = useRef<number | null>(null);

  const handleLineClick = useCallback((event: React.MouseEvent, index: number) => {
    const id = entries[index]?.id;
    if (id == null) return;
    setSelected((prev) => {
      if (event.shiftKey && anchorRef.current != null) {
        const anchorAt = entries.findIndex((entry) => entry.id === anchorRef.current);
        const from = anchorAt < 0 ? index : Math.min(anchorAt, index);
        const to = anchorAt < 0 ? index : Math.max(anchorAt, index);
        const next = new Set(event.ctrlKey || event.metaKey ? prev : []);
        for (let i = from; i <= to; i++) next.add(entries[i].id);
        return next;
      }
      anchorRef.current = id;
      if (event.ctrlKey || event.metaKey) {
        const next = new Set(prev);
        if (next.has(id)) next.delete(id); else next.add(id);
        return next;
      }
      return prev.size === 1 && prev.has(id) ? new Set() : new Set([id]);
    });
  }, [entries]);

  const clearSelection = useCallback(() => {
    anchorRef.current = null;
    setSelected(new Set());
  }, []);

  return { selected, handleLineClick, clearSelection };
};

export { useLogSelection };
