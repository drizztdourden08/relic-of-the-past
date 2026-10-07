/* @layer renderer-components @kind component */
/**
 * The randomizer page's activity feed: randomizer-channel and error-channel
 * entries, newest at the bottom, rendered through the shared LogPanel so it
 * gets the same windowing, search, copy and type filter the simulation log has.
 */
import { useCallback, useMemo, useState } from 'react';
import { LogPanel } from '@ds/composites/LogPanel';
import { ACTIVITY_KINDS, classifyEntry, entriesToText, toActivityRows } from '../behavior/randomizer-log-style';
import type { LogEntry } from '../../../../../../lib/log-bus';

interface ActivityLogProps {
  entries: LogEntry[];
}

const ActivityLog = ({ entries }: ActivityLogProps) => {
  const [hidden, setHidden] = useState<Set<string>>(() => new Set());
  const [search, setSearch] = useState('');

  const toggle = useCallback((kind: string) => {
    setHidden((prev) => {
      const next = new Set(prev);
      if (next.has(kind)) next.delete(kind); else next.add(kind);
      return next;
    });
  }, []);

  const rows = useMemo(() => {
    const kept = hidden.size > 0 ? entries.filter((e) => !hidden.has(classifyEntry(e).kind)) : entries;
    return toActivityRows(kept);
  }, [entries, hidden]);

  const copyText = useCallback(() => entriesToText(entries), [entries]);

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
