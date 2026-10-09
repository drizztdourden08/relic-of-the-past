/* @layer renderer-app @kind logic */
import type { IdRefOption } from '@drizztdourden08/tessera/composites';

const narrowedOptionCache = new Map<string, readonly IdRefOption[]>();

export { narrowedOptionCache };
