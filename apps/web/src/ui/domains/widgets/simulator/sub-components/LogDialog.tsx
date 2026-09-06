/* @layer renderer-widgets @kind component */
/** Full simulation log in a modal, the only place the log is read. Adapts the
 *  run's events into LogPanel rows and hands the panel the toolbar it needs
 *  (count, copy-all, type filter). Kinds are filtered HERE, before the indents
 *  are computed, so hiding a marker type re-levels the rows under it. */
import { useCallback, useMemo, useState } from 'react';
import type { SimEvent } from '@shared/game/simulation';
import { DialogShell } from '@ds/composites';
import { LogPanel } from '@ds/composites/LogPanel';
import { classifyEvent, eventsToText, LOG_KINDS, toLogRows } from './log-event-style';
import type { LogKind } from './log-event-style';
import './SimLog.css';

interface LogDialogProps {
  open: boolean;
  onClose: () => void;
  events: SimEvent[];
}

const LogDialog = (props: LogDialogProps) => {
  const { open, onClose, events } = props;
  const [hidden, setHidden] = useState<Set<LogKind>>(new Set());
  const [search, setSearch] = useState('');

  const toggle = useCallback((kind: string) => {
    setHidden((prev) => {
      const next = new Set(prev);
      if (next.has(kind as LogKind)) next.delete(kind as LogKind); else next.add(kind as LogKind);
      return next;
    });
  }, []);

  const rows = useMemo(() => {
    const kept = hidden.size > 0 ? events.filter((e) => !hidden.has(classifyEvent(e).kind)) : events;
    return toLogRows(kept);
  }, [events, hidden]);

  const copyText = useCallback(() => eventsToText(events), [events]);

  return (
    <DialogShell open={open} onClose={onClose} title="Simulation Log" className="sim-log-dialog">
      <LogPanel
        className="sim-log"
        rows={rows}
        kinds={LOG_KINDS}
        hidden={hidden}
        onToggleKind={toggle}
        search={search}
        onSearchChange={setSearch}
        copyText={copyText}
        countLabel="events"
        emptyLabel="No events."
      />
    </DialogShell>
  );
};

export { LogDialog };
