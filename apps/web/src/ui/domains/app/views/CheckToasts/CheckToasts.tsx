/* @layer renderer-components @kind component */
/**
 * A toast per check or event the player just completed, stacked at the bottom left of the play
 * area (the game picture, never the whole window). Each one is the tracker's own card, so it shows what the tracker shows: the sprite,
 * the item or event, and the place. On a seed the card holds what the seed placed there.
 * An online session's notices (items both ways, the connection, DeathLink and the rest, each
 * kind toggled in the Online settings) join the same stack, one line each.
 */
import { useCallback, useEffect, useMemo, useState } from 'react';
import type { CSSProperties } from 'react';
import { Box, ToastContainer } from '@ds/primitives';
import type { ToastItem } from '@ds/primitives';
import { shownItemOf } from '@shared/game/logic/queries/check-contents';
import type { RunContext } from '@shared/game/logic/queries/check-grouping';
import {
  buildPlacementView, getSessionState, runKindOfSession, subscribeSessionStore,
} from '@app/lib/game/randomizer-client';
import { CheckCard } from '@domains/app/compounds/ChecksTracker';
import { CHECKS_PREF_KEY, NOTIFY_PREF, NOTIFY_WHEN_CLOSED_PREF } from '@domains/widgets/checks/checks.constants';
import { useWidgetPref } from '../../../../../hooks/useWidgetPref';
import { useTrackerPresenceStore } from '@app/stores/tracker-presence-store';
import { useCheckToasts } from './behavior/useCheckToasts';
import { useOnlineNoticeToasts } from './behavior/useOnlineNoticeToasts';
import { OnlineNoticeToast } from './sub-components/OnlineNoticeToast';
import './CheckToasts.css';

const TOAST_DURATION_MS = 5000;

interface CheckToastsProps {
  /** The play area's size: the box is laid over the game picture like the HUD overlay. */
  width: number;
  height: number;
}

const CheckToasts = ({ width, height }: CheckToastsProps) => {
  const [notify] = useWidgetPref<boolean>(CHECKS_PREF_KEY, NOTIFY_PREF, true);
  const [notifyWhenClosed] = useWidgetPref<boolean>(CHECKS_PREF_KEY, NOTIFY_WHEN_CLOSED_PREF, true);
  const trackerOpen = useTrackerPresenceStore((state) => state.open);
  const { entries, dismiss } = useCheckToasts(notify && (trackerOpen || notifyWhenClosed));
  const notices = useOnlineNoticeToasts();
  const [sessionState, setSessionState] = useState(() => getSessionState());
  useEffect(() => subscribeSessionStore(setSessionState), []);
  // The same run context the tracker's own rows read, so a card here and a row there can never
  // show two different items for one check.
  const run: RunContext = useMemo(() => {
    const view = buildPlacementView(sessionState.placement, sessionState.foreignOwners);
    return { kind: runKindOfSession(sessionState), placedItems: view.itemByCheck, foreignItems: view.foreignByCheck };
  }, [sessionState]);

  const toasts: ToastItem[] = useMemo(() => entries.flatMap(({ id, check, paid }) => {
    // A status-only row ticks and unticks with the live state: not something that was done.
    if (check.statusOnly) return [];
    return [{
      id,
      message: check.name,
      variant: 'bare' as const,
      duration: TOAST_DURATION_MS,
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

  const noticeToasts: ToastItem[] = useMemo(() => notices.entries.map(({ id, notice }) => ({
    id,
    message: notice.text,
    variant: 'bare' as const,
    duration: TOAST_DURATION_MS,
    content: <OnlineNoticeToast notice={notice} />,
  })), [notices.entries]);

  const allToasts = useMemo(() => [...toasts, ...noticeToasts], [toasts, noticeToasts]);
  const { dismiss: dismissNotice, settings } = notices;
  const dismissAny = useCallback((id: string) => {
    dismiss(id);
    dismissNotice(id);
  }, [dismiss, dismissNotice]);
  // A notice draws its names in the message highlight colours the profile chose.
  const style = useMemo(() => ({
    width,
    height,
    ...(settings ? { '--notice-item': settings.hudHighlightPrimary, '--notice-player': settings.hudHighlightSecondary } : {}),
  }) as CSSProperties, [width, height, settings]);

  return (
    <Box className="check-toasts" style={style}>
      <ToastContainer toasts={allToasts} onDismiss={dismissAny} position="bottom-left" anchored />
    </Box>
  );
};

export { CheckToasts };
