/* @layer renderer-widgets @kind component */
/** Full simulation log in a modal — the only place the log is read, so it carries
 *  the whole toolbar: event count, copy-all, and the show/hide type filter, over
 *  a selectable, windowed log container (older rows load on demand). */
import { useState, useCallback } from 'react';
import { Box, Text, Button } from '@ds/primitives';
import type { SimEvent } from '@shared/game/simulation';
import { DialogShell } from '@ds/composites';
import { LogView } from './LogView';
import { LogFilter } from './LogFilter';
import { eventsToText } from './log-event-style';
import type { LogKind } from './log-event-style';

interface LogDialogProps {
  open: boolean;
  onClose: () => void;
  events: SimEvent[];
}

const LogDialog = (props: LogDialogProps) => {
  const { open, onClose, events } = props;
  const [hidden, setHidden] = useState<Set<LogKind>>(new Set());
  const [copied, setCopied] = useState(false);

  const toggle = useCallback((kind: LogKind) => {
    setHidden((prev) => {
      const next = new Set(prev);
      if (next.has(kind)) next.delete(kind); else next.add(kind);
      return next;
    });
  }, []);

  const copyAll = useCallback(() => {
    void navigator.clipboard?.writeText(eventsToText(events)).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  }, [events]);

  return (
    <DialogShell open={open} onClose={onClose} title="Simulation Log" className="sim-log-dialog">
      <Box className="sim-log-dialog__toolbar">
        <Text className="sim-log-dialog__count">{events.length} events</Text>
        <Button variant="tertiary" size="sm" onClick={copyAll} disabled={events.length === 0}>
          {copied ? '✓ Copied' : '⧉ Copy all'}
        </Button>
        <LogFilter hidden={hidden} onToggle={toggle} />
      </Box>
      <Box className="sim-log-dialog__body">
        <LogView events={events} hidden={hidden} />
      </Box>
    </DialogShell>
  );
};

export { LogDialog };
