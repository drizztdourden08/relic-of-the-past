/* @layer renderer-components @kind component */
import { useMemo } from 'react';
import { Button, Text } from '@ds/primitives';
import { DashboardPanel, LogLines } from '@ds/composites';
import { recentActivityOf } from '../behavior/recent-activity';
import type { RecentActivityProps } from './RecentActivity.type';

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
