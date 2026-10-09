/* @layer renderer-widgets @kind component */
import { useCallback, useMemo } from 'react';
import { DialogShell, LogPanel } from '@drizztdourden08/tessera/composites';
import { eventsToText, toLogRows } from '../behavior/log-events';
import { LOG_KINDS } from '../SimulatorWidget.constants';
import type { LogDialogProps } from '../SimulatorWidget.type';
import './LogDialog.css';

const LogDialog = (props: LogDialogProps) => {
  const { open, onClose, events } = props;
  const rows = useMemo(() => toLogRows(events), [events]);
  const copyText = useCallback(() => eventsToText(events), [events]);

  return (
    <DialogShell open={open} onClose={onClose} title="Simulation Log" className="sim-log-dialog">
      <LogPanel
        height="fill"
        rows={rows}
        kinds={LOG_KINDS}
        copyText={copyText}
        countLabel="events"
        emptyLabel="No events."
      />
    </DialogShell>
  );
};

export { LogDialog };
