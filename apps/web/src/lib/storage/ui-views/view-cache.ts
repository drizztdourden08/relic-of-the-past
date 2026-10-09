/* @layer renderer-lib @kind logic */
import type { ViewSnapshot } from '@ds/data';

const viewCache: {
  map: Record<string, ViewSnapshot> | null;
  loading: Promise<Record<string, ViewSnapshot>> | null;
  saveTimer: ReturnType<typeof setTimeout> | null;
} = { map: null, loading: null, saveTimer: null };

export { viewCache };
