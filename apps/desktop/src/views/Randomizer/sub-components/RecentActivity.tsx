/* @layer renderer-components @kind component */
import { useMemo } from 'react';
import { Button, Text } from '@drizztdourden08/tessera/primitives';
import { LogPanel } from '@drizztdourden08/tessera/composites';
import { recentActivityOf } from '../behavior/recent-activity';
import { RECENT_HEIGHT } from '../behavior/recent-activity.constants';
import { ACTIVITY_KINDS } from '../behavior/randomizer-log-style.constants';
import { DashboardCard } from './DashboardCard';
import type { RecentActivityProps } from './RecentActivity.type';

const RecentActivity = (props: RecentActivityProps) => {
  const { placement, entries, roomLines, onOpenLog } = props;
  const rows = useMemo(() => recentActivityOf(entries, roomLines), [entries, roomLines]);
  const openLog = <Button variant="secondary" size="sm" onClick={onOpenLog}>Open log</Button>;

  return (
    <DashboardCard placement={placement} title="Recent activity" actions={openLog}>
      {rows.length === 0
        ? <Text className="randomizer-page__hint">Nothing yet.</Text>
        : <LogPanel rows={rows} kinds={ACTIVITY_KINDS} toolbar={false} height={RECENT_HEIGHT} className="randomizer-log" />}
    </DashboardCard>
  );
};

export { RecentActivity };
