/* @layer renderer-components @kind hook */
import { useCallback, useEffect, useRef, useState } from 'react';
import { onOnlineNotice, queueNotice } from '@app/game/randomizer-client';
import type { NoticeEntry } from '@app/game/randomizer-client';
import { useSettings } from '@drizztdourden08/brock-react';
import type { AppSettings } from '@app/settings.type';
import { isToastQuiet } from '@app/game/play-quiet';

const useOnlineNoticeToasts = () => {
  const { settings } = useSettings<AppSettings>();
  const settingsRef = useRef(settings);
  settingsRef.current = settings;
  const [entries, setEntries] = useState<readonly NoticeEntry[]>([]);
  const serial = useRef(0);

  useEffect(() => onOnlineNotice((notice) => {
    if (isToastQuiet(0)) return;
    const now = Date.now();
    const shownWith = settingsRef.current;
    const nextId = (): string => `online-notice-${serial.current++}`;
    setEntries((prev) => queueNotice({ entries: prev, notice, settings: shownWith, now, nextId }));
  }), []);

  const dismiss = useCallback((id: string) => {
    setEntries((prev) => prev.filter((entry) => entry.id !== id));
  }, []);

  return { entries, dismiss, settings };
};

export { useOnlineNoticeToasts };
