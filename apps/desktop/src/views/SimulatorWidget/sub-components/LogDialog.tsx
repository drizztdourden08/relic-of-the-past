/* @layer renderer-widgets @kind component */
import { useCallback, useMemo } from 'react';
import { useT } from '@drizztdourden08/brock-react';
import { DialogShell, LogPanel } from '@drizztdourden08/tessera/composites';
import { eventsToText } from '../behavior/events-to-text';
import { toLogRows } from '../behavior/to-log-rows';
import { logKinds } from '../SimulatorWidget.constants';
import type { LogDialogProps } from '../SimulatorWidget.type';
import './LogDialog.css';

const LogDialog = (props: LogDialogProps) => {
  const { open, onClose, events } = props;
  const t = useT();
  const rows = useMemo(() => toLogRows(events), [events]);
  const copyText = useCallback(() => eventsToText(events), [events]);

  return (
    <DialogShell open={open} onClose={onClose} title={t('views-simulator:log.title')} className="sim-log-dialog">
      <LogPanel
        height="fill"
        rows={rows}
        kinds={logKinds(t)}
        copyText={copyText}
        countLabel={t('views-simulator:log.count')}
        emptyLabel={t('views-simulator:log.empty')}
      />
    </DialogShell>
  );
};

export { LogDialog };
