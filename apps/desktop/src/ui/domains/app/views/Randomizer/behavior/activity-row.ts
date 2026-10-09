/* @layer renderer-components @kind logic */
import type { LogEntry } from '../../../../../../lib/log-bus';
import type { LogRow } from '@drizztdourden08/tessera/composites';
import { classifyEntry } from './classify-entry';
import { formatTime } from './format-time';
import { SESSION_PREFIX } from './randomizer-log-style.constants';

const stripSessionPrefix = (message: string): string => message.replace(SESSION_PREFIX, '');

const activityRowOf = (entry: LogEntry): LogRow => {
  const { kind, tag } = classifyEntry(entry);
  return {
    id: String(entry.id),
    gutter: formatTime(entry.timestamp),
    tag,
    kind,
    message: stripSessionPrefix(entry.message),
  };
};

export { activityRowOf };
