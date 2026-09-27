/* @layer renderer-components @kind hook */
/**
 * The online session's notices as a short-lived queue, for the same toast stack the checks use.
 * A kind the profile's settings turn off shows nothing, and a burst folds into one summary
 * (notice-burst.ts). The settings are read as each notice arrives, so a toggle acts at once.
 */
import { useCallback, useEffect, useRef, useState } from 'react';
import { onOnlineNotice, queueNotice } from '@app/lib/game/randomizer-client';
import type { NoticeEntry } from '@app/lib/game/randomizer-client';
import { useSearchStore } from '@app/stores/search-store';

const useOnlineNoticeToasts = () => {
  const settings = useSearchStore((state) => state.settings);
  const settingsRef = useRef(settings);
  settingsRef.current = settings;
  const [entries, setEntries] = useState<readonly NoticeEntry[]>([]);
  const serial = useRef(0);

  useEffect(() => onOnlineNotice((notice) => {
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
