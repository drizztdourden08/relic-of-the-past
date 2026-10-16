/* @layer renderer-components @kind types */
import type { StorageSummary } from '@drizztdourden08/brock-core';

interface DataStorageDetailsProps {
  summary: StorageSummary | null;
  loading: boolean;
}

export type { DataStorageDetailsProps };
