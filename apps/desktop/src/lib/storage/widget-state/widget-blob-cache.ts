/* @layer renderer-lib @kind logic */
import type { TrackerStateBlob } from '../../tracker-state-io';

const widgetBlobCache: {
  cacheId: string | null;
  cache: TrackerStateBlob | null;
  loadingId: string | null;
  loading: Promise<TrackerStateBlob> | null;
  timer: ReturnType<typeof setTimeout> | null;
  dirty: boolean;
  inFlight: Promise<void>;
} = {
  cacheId: null,
  cache: null,
  loadingId: null,
  loading: null,
  timer: null,
  dirty: false,
  inFlight: Promise.resolve(),
};

export { widgetBlobCache };
