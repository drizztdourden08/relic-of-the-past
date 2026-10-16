/* @layer renderer-components @kind types */
import type { StorageSummary } from '@drizztdourden08/brock-core';

interface DataHomeProps {
  summary: StorageSummary | null;
  loading: boolean;
  open: (target: string) => void;
}

export type { DataHomeProps };
