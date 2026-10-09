/* @layer renderer-lib @kind logic */
import type { ViewSnapshot } from '@drizztdourden08/tessera/data';

const viewCache: {
  map: Record<string, ViewSnapshot> | null;
  loading: Promise<Record<string, ViewSnapshot>> | null;
  saveTimer: ReturnType<typeof setTimeout> | null;
} = { map: null, loading: null, saveTimer: null };

export { viewCache };
