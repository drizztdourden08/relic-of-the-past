/* @layer renderer-widgets @kind component */
import { useCallback, useMemo, useState } from 'react';
import { DialogShell, LogPanel } from '@drizztdourden08/tessera/composites';
import { classifyEvent, eventsToText, toLogRows } from '../behavior/log-events';
import { LOG_KINDS } from '../SimulatorWidget.constants';
import type { LogDialogProps, LogKind } from '../SimulatorWidget.type';
import './SimLog.css';

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
