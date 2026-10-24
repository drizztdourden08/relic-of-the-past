/* @layer renderer-components @kind types */
import type { MappingEntry } from '@drizztdourden08/brock-input';

interface MappingList {
  entries: readonly MappingEntry[];
  loaded: boolean;
}

export type { MappingList };
