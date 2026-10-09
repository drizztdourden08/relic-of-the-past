/* @layer renderer-lib @kind logic */
import { WIDGET_SAVE_DEBOUNCE_MS } from './widget-state.constants';
import { widgetBlobCache } from './widget-blob-cache';
import { writePending } from './write-pending';

const scheduleWrite = (): void => {
  widgetBlobCache.dirty = true;
  if (widgetBlobCache.timer !== null) clearTimeout(widgetBlobCache.timer);
  widgetBlobCache.timer = setTimeout(writePending, WIDGET_SAVE_DEBOUNCE_MS);
};

export { scheduleWrite };
