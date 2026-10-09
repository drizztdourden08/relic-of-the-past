/* @layer renderer-lib @kind logic */
import type { TrackerStateBlob } from '../../tracker-state-io';
import { widgetBlobCache } from './widget-blob-cache';
import { loadWidgetBlob } from './load-widget-blob';
import { scheduleWrite } from './schedule-write';

const applyPatch = (profileId: string, patch: Partial<TrackerStateBlob>): void => {
  if (widgetBlobCache.cacheId !== profileId || !widgetBlobCache.cache) return;
  Object.assign(widgetBlobCache.cache, patch);
  scheduleWrite();
};

const patchWidgetBlob = (profileId: string, patch: Partial<TrackerStateBlob>): void => {
  if (widgetBlobCache.cacheId === profileId && widgetBlobCache.cache) {
    applyPatch(profileId, patch);
    return;
  }
  void loadWidgetBlob(profileId).then(() => applyPatch(profileId, patch));
};

export { patchWidgetBlob };
