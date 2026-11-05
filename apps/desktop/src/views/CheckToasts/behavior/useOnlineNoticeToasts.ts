/* @layer renderer-components @kind hook */
import { useCallback, useEffect, useRef, useState } from 'react';
import { deathLinkOnlineNotice, queueNotice } from '@drizztdourden08/brock-randomizer/archipelago';
import type { NoticeEntry, OnlineNotice } from '@drizztdourden08/brock-randomizer/archipelago';
import { onlineEvents } from '@drizztdourden08/brock-randomizer/session';
import { useSettings } from '@drizztdourden08/brock-react';
import { isNoticeKindShown } from '@rotp/randomizer';
import type { AppSettings } from '@app/settings.type';
import { isToastQuiet } from '@app/game/play-quiet';

const useOnlineNoticeToasts = () => {
  const { settings } = useSettings<AppSettings>();
  const settingsRef = useRef(settings);
  settingsRef.current = settings;
  const [entries, setEntries] = useState<readonly NoticeEntry[]>([]);
  const serial = useRef(0);

  useEffect(() => {
    const admit = (notice: OnlineNotice): void => {
      if (isToastQuiet(0)) return;
      const now = Date.now();
      const nextId = (): string => `online-notice-${serial.current++}`;
      const shown = (kind: OnlineNotice['kind']): boolean => isNoticeKindShown(settingsRef.current, kind);
      setEntries((prev) => queueNotice({ entries: prev, notice, shown, now, nextId }));
    };
    return onlineEvents.add((event) => {
      if (event.type === 'notice') admit(event.notice);
      if (event.type === 'death-link') admit(deathLinkOnlineNotice(event.notice));
    });
  }, []);

  const dismiss = useCallback((id: string) => {
    setEntries((prev) => prev.filter((entry) => entry.id !== id));
  }, []);

  return { entries, dismiss, settings };
};

export { useOnlineNoticeToasts };
