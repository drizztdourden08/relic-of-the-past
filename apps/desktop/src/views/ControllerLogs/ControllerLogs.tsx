/* @layer renderer-components @kind component */
import { useMemo, useState } from 'react';
import { LogPanel } from '@drizztdourden08/tessera/composites';
import { useControllerEventLog } from '@app/input/controller-event-log/useControllerEventLog';
import { logRowsOf } from './behavior/log-rows';
import { rowsToText } from './behavior/rows-to-text';
import { CONTROLLER_LOG_COUNT_LABEL, CONTROLLER_LOG_EMPTY, CONTROLLER_LOG_KINDS } from './ControllerLogs.constants';

const ControllerLogs = () => {
  const events = useControllerEventLog();
  const [search, setSearch] = useState('');
  const rows = useMemo(() => logRowsOf(events), [events]);

  return (
    <LogPanel
      rows={rows}
      kinds={CONTROLLER_LOG_KINDS}
      search={search}
      onSearchChange={setSearch}
      copyText={rowsToText}
      countLabel={CONTROLLER_LOG_COUNT_LABEL}
      emptyLabel={CONTROLLER_LOG_EMPTY}
    />
  );
};

export { ControllerLogs };
