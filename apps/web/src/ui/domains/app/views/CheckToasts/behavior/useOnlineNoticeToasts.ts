/* @layer renderer-components @kind hook */
import { useCallback, useEffect, useRef, useState } from 'react';
import { onOnlineNotice, queueNotice } from '@app/lib/game/randomizer-client';
import type { NoticeEntry } from '@app/lib/game/randomizer-client';
import { useSearchStore } from '@app/stores/search-store';
import { isToastQuiet } from '@app/lib/game/play-quiet';

const useOnlineNoticeToasts = () => {
  const settings = useSearchStore((state) => state.settings);
  const settingsRef = useRef(settings);
  settingsRef.current = settings;
  const [entries, setEntries] = useState<readonly NoticeEntry[]>([]);
  const serial = useRef(0);

  useEffect(() => onOnlineNotice((notice) => {
    if (isToastQuiet(0)) return;
    const now = Date.now();
    const shownWith = settingsRef.current;
    const nextId = (): string => `online-notice-${serial.current++}`;
    setEntries((prev) => queueNotice(prev, notice, shownWith, now, nextId));
  }), []);

  const dismiss = useCallback((id: string) => {
    setEntries((prev) => prev.filter((entry) => entry.id !== id));
  }, []);

  return { entries, dismiss, settings };
};

export { useOnlineNoticeToasts };
