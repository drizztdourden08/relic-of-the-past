/* @layer renderer-components @kind hook */
import { useState, useEffect, type RefObject } from 'react';
import { subscribe, getEntries, type LogEntry } from '../../../../../../lib/log-bus';

const MAX_ENTRIES = 200;

const useLogOverlay = (bottomRef: RefObject<HTMLDivElement | null>) => {
  const [visible, setVisible] = useState(false);
  const [entries, setEntries] = useState<LogEntry[]>(() => getEntries());

  // Keyboard toggle
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'F12') {
        e.preventDefault();
        setVisible((v) => !v);
      }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, []);

  // Subscribe to log bus
  useEffect(() => {
    return subscribe((entry) => {
      setEntries((prev) => {
        const next = [...prev, entry];
        return next.length > MAX_ENTRIES ? next.slice(-MAX_ENTRIES) : next;
      });
      // Auto-show on error
      if (entry.level === 'error') setVisible(true);
    });
  }, []);

  // Auto-scroll
  useEffect(() => {
    if (visible) bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [entries, visible, bottomRef]);

  return { visible, setVisible, entries };
}

export { useLogOverlay };
