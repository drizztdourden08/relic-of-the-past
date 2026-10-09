/* @layer renderer-components @kind component */
import { useCallback, useEffect, useMemo, useState } from 'react';
import type { CSSProperties } from 'react';
import { Box } from '@drizztdourden08/tessera/primitives';
import { shownItemOf } from '@shared/game/logic/queries/check-contents';
import type { RunContext } from '@shared/game/logic/queries/check-grouping';
import {
  buildPlacementView, getSessionState, runKindOfSession, subscribeSessionStore,
} from '@app/lib/game/randomizer-client';
import { CheckCard } from '@domains/app/compounds/ChecksTracker';
import { CHECKS_PREF_KEY, NOTIFY_PREF, NOTIFY_WHEN_CLOSED_PREF } from '@domains/widgets/checks/checks.constants';
import { useWidgetPref } from '@drizztdourden08/brock-react';
import { useTrackerPresenceStore } from '@app/stores/tracker-presence-store';
import { useCheckToasts } from './behavior/useCheckToasts';
import { useOnlineNoticeToasts } from './behavior/useOnlineNoticeToasts';
import { OnlineNoticeToast } from './sub-components/OnlineNoticeToast';
import { PlayAreaNotice } from './sub-components/PlayAreaNotice';
import type { PlayAreaNoticeItem } from './sub-components/PlayAreaNotice.type';
import { TOAST_DURATION_MS } from './CheckToasts.constants';
import type { CheckToastsProps } from './CheckToasts.type';
import './CheckToasts.css';

const CheckToasts = ({ width, height }: CheckToastsProps) => {
  const [notify] = useWidgetPref<boolean>(CHECKS_PREF_KEY, NOTIFY_PREF, true);
  const [notifyWhenClosed] = useWidgetPref<boolean>(CHECKS_PREF_KEY, NOTIFY_WHEN_CLOSED_PREF, true);
  const trackerOpen = useTrackerPresenceStore((state) => state.open);
  const { entries, dismiss } = useCheckToasts(notify && (trackerOpen || notifyWhenClosed));
  const notices = useOnlineNoticeToasts();
  const [sessionState, setSessionState] = useState(() => getSessionState());
  useEffect(() => subscribeSessionStore(setSessionState), []);
  const run: RunContext = useMemo(() => {
    const view = buildPlacementView(sessionState.placement, sessionState.foreignOwners);
    return { kind: runKindOfSession(sessionState), placedItems: view.itemByCheck, foreignItems: view.foreignByCheck };
  }, [sessionState]);

  const toasts: PlayAreaNoticeItem[] = useMemo(() => entries.flatMap(({ id, check, paid }) => {
    if (check.statusOnly) return [];
    return [{
      id,
      label: check.name,
      content: (
        <Box className="check-toast">
          <CheckCard
            check={check} status="completed" item={shownItemOf({ check, run, receipt: paid })}
            foreignItem={run.foreignItems?.get(check.id)}
          />
        </Box>
      ),
    }];
  }), [entries, run]);

  const noticeToasts: PlayAreaNoticeItem[] = useMemo(() => notices.entries.map(({ id, notice }) => ({
    id,
    label: notice.text,
    content: <OnlineNoticeToast notice={notice} />,
  })), [notices.entries]);

  const allToasts = useMemo(() => [...toasts, ...noticeToasts], [toasts, noticeToasts]);
  const { dismiss: dismissNotice, settings } = notices;
  const dismissAny = useCallback((id: string) => {
    dismiss(id);
    dismissNotice(id);
  }, [dismiss, dismissNotice]);
  const style = useMemo(() => ({
    width,
    height,
    ...(settings ? { '--notice-item': settings.hudHighlightPrimary, '--notice-player': settings.hudHighlightSecondary } : {}),
  }) as CSSProperties, [width, height, settings]);

  return (
    <Box className="check-toasts" style={style}>
      {allToasts.length > 0 && (
        <Box className="play-area-notices">
          {allToasts.map((item) => (
            <PlayAreaNotice key={item.id} item={item} duration={TOAST_DURATION_MS} onDismiss={dismissAny} />
          ))}
        </Box>
      )}
    </Box>
  );
};

export { CheckToasts };
