/* @layer renderer-components @kind types */
import type { LogRow } from '@ds/composites/LogPanel';

interface ActivityItem {
  at: number;
  row: LogRow;
}

export type { ActivityItem };
