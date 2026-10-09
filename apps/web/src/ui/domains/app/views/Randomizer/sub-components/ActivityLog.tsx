/* @layer renderer-components @kind component */
import { useCallback, useMemo, useState } from 'react';
import { LogPanel } from '@ds/composites/LogPanel';
import { ACTIVITY_KINDS } from '../behavior/randomizer-log-style.constants';
import { rowsToText } from '../behavior/rows-to-text';
import { buildActivityRows } from '../behavior/activity-feed';
import type { ActivityLogProps } from './ActivityLog.type';

const ActivityLog = ({ entries, roomLines }: ActivityLogProps) => {
  const [hidden, setHidden] = useState<Set<string>>(() => new Set());
  const [search, setSearch] = useState('');

  const toggle = useCallback((kind: string) => {
    setHidden((prev) => {
      const next = new Set(prev);
      if (next.has(kind)) next.delete(kind); else next.add(kind);
      return next;
    });
  }, []);

  const rows = useMemo(() => buildActivityRows(entries, roomLines, hidden), [entries, roomLines, hidden]);

  const copyText = useCallback(
    () => rowsToText(buildActivityRows(entries, roomLines)),
    [entries, roomLines],
  );

  return (
    <LogPanel
      className="randomizer-log"
      rows={rows}
      kinds={ACTIVITY_KINDS}
      hidden={hidden}
      onToggleKind={toggle}
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
