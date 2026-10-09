/* @layer renderer-lib @kind logic */
import { log } from '../../log-bus';
import { VIEW_SAVE_DEBOUNCE_MS } from './ui-views.constants';
import { viewCache } from './view-cache';

const flush = (): void => {
  viewCache.saveTimer = null;
  if (!viewCache.map) return;
  window.api.uiViews.save(viewCache.map).catch((error: unknown) => {
    log.ipc(`Failed to save ui-views.json: ${String(error)}`, 'error');
  });
};

const scheduleViewSave = (): void => {
  if (viewCache.saveTimer !== null) clearTimeout(viewCache.saveTimer);
  viewCache.saveTimer = setTimeout(flush, VIEW_SAVE_DEBOUNCE_MS);
};

export { scheduleViewSave };
