/* @layer renderer-components @kind logic */
import { formatDate } from '@drizztdourden08/tessera/primitives';
import type { LogRow } from '@drizztdourden08/tessera/composites';
import type { ControllerEvent } from '@app/input/controller-event-log/controller-event-log.type';
import { CONTROLLER_LOG_TAGS } from '../ControllerLogs.constants';

const logRowOf = (event: ControllerEvent): LogRow => ({
  id: event.id,
  gutter: formatDate(event.time, 'time', { length: 'medium' }),
  tag: CONTROLLER_LOG_TAGS[event.kind],
  kind: event.kind,
  message: event.text,
});

const logRowsOf = (events: readonly ControllerEvent[]): LogRow[] => events.map(logRowOf);

export { logRowsOf };
