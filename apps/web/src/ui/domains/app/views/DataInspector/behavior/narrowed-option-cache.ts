/* @layer renderer-app @kind logic */
import type { IdRefOption } from '@ds/composites/RecordEditor';

const narrowedOptionCache = new Map<string, readonly IdRefOption[]>();

export { narrowedOptionCache };
