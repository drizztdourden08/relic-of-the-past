/* @layer renderer-components @kind component */
/**
 * The randomizer page's activity feed: randomizer-channel and error-channel
 * entries, merged in time order with the Archipelago room's messages (tagged
 * AP), newest at the bottom. Rendered through the shared LogPanel so it gets
 * the same windowing, search, copy and type filter the simulation log has.
 */
import { useCallback, useMemo, useState } from 'react';
import { LogPanel } from '@ds/composites/LogPanel';
import { ACTIVITY_KINDS, rowsToText } from '../behavior/randomizer-log-style';
import { buildActivityRows } from '../behavior/activity-feed';
import type { LogEntry } from '../../../../../../lib/log-bus';
import type { RoomMessage } from '../../../../../../lib/game/randomizer-client';

interface ActivityLogProps {
  entries: LogEntry[];
  roomLines: readonly RoomMessage[];
}

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
