/* @layer renderer-components @kind component */
/**
 * The Run tab's last few moments of the run, newest first: the activity feed kept to what
 * matters in a run (behavior/recent-activity.ts), drawn with the log panel's own rows and
 * coloured by kind in the Logs tab's palette. The whole feed is the Logs tab, one click away.
 */
import { useMemo } from 'react';
import { Button, Text } from '@ds/primitives';
import { DashboardPanel, LogLines } from '@ds/composites';
import { recentActivityOf } from '../behavior/recent-activity';
import type { LogEntry } from '../../../../../../lib/log-bus';
import type { RoomMessage } from '../../../../../../lib/game/randomizer-client';
import type { PanelPlacement } from '../Randomizer.constants';

interface RecentActivityProps {
  placement: PanelPlacement;
  entries: LogEntry[];
  roomLines: readonly RoomMessage[];
  onOpenLog: () => void;
}

const RecentActivity = (props: RecentActivityProps) => {
  const { placement, entries, roomLines, onOpenLog } = props;
  const rows = useMemo(() => recentActivityOf(entries, roomLines), [entries, roomLines]);
  const openLog = <Button variant="secondary" size="sm" onClick={onOpenLog}>Open log</Button>;

  return (
    <DashboardPanel {...placement} title="Recent activity" action={openLog}>
      {rows.length === 0
        ? <Text className="randomizer-page__hint">Nothing yet. Checks, items and the session show here as they happen.</Text>
        : <LogLines rows={rows} className="randomizer-log" />}
    </DashboardPanel>
  );
};

export { RecentActivity };
export type { RecentActivityProps };
