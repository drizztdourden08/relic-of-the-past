/* @layer renderer-components @kind component */
import { useCallback, useMemo, useState } from 'react';
import { LogPanel } from '@drizztdourden08/tessera/composites';
import { ACTIVITY_KINDS } from '../behavior/randomizer-log-style.constants';
import { rowsToText } from '../behavior/rows-to-text';
import { buildActivityRows } from '../behavior/activity-feed';
import type { ActivityLogProps } from './ActivityLog.type';

const ActivityLog = ({ entries, roomLines }: ActivityLogProps) => {
  const [search, setSearch] = useState('');

  const rows = useMemo(() => buildActivityRows(entries, roomLines), [entries, roomLines]);

  const copyText = useCallback(() => rowsToText(rows), [rows]);

  return (
    <LogPanel
      className="randomizer-log"
      rows={rows}
      kinds={ACTIVITY_KINDS}
      search={search}
      onSearchChange={setSearch}
      copyText={copyText}
      countLabel="entries"
      emptyLabel="No activity yet."
    />
  );
};

export { ActivityLog };
export type { ActivityLogProps };
