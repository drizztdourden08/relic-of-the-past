/* @layer renderer-lib @kind logic */
import { loadTrackerStateBlob } from '../../tracker-state-io';
import type { TrackerStateBlob } from '../../tracker-state-io';
import { log } from '../../log-bus';
import { widgetBlobCache } from './widget-blob-cache';
import { flushWidgetBlob } from './flush-widget-blob';

const loadFresh = async (profileId: string): Promise<TrackerStateBlob> => {
  await flushWidgetBlob();
  const raw = await loadTrackerStateBlob(profileId).catch((error: unknown) => {
    log.ipc(`Failed to load widget state for ${profileId}: ${String(error)}`, 'error');
    return null;
  });
  const blob = raw ?? {};
  widgetBlobCache.cache = blob;
  widgetBlobCache.cacheId = profileId;
  widgetBlobCache.loading = null;
  widgetBlobCache.loadingId = null;
  return blob;
};

const loadWidgetBlob = (profileId: string): Promise<TrackerStateBlob> => {
  const state = widgetBlobCache;
  if (state.cacheId === profileId && state.cache) return Promise.resolve(state.cache);
  if (state.loadingId === profileId && state.loading) return state.loading;
  state.loadingId = profileId;
  state.loading = loadFresh(profileId);
  return state.loading;
};

export { loadWidgetBlob };
