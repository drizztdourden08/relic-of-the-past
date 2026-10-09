/* @layer renderer-lib @kind logic */
import { getPlatform } from '@drizztdourden08/brock-react';
import { log } from '../../log-bus';
import { DATA_VIEWS_FILE, VIEW_SAVE_DEBOUNCE_MS } from './ui-views.constants';
import { viewCache } from './view-cache';

const flush = (): void => {
  viewCache.saveTimer = null;
  if (!viewCache.map) return;
  getPlatform().files.writeText(DATA_VIEWS_FILE, JSON.stringify(viewCache.map)).catch((error: unknown) => {
    log.ipc(`Failed to save ${DATA_VIEWS_FILE}: ${String(error)}`, 'error');
  });
};

const scheduleViewSave = (): void => {
  if (viewCache.saveTimer !== null) clearTimeout(viewCache.saveTimer);
  viewCache.saveTimer = setTimeout(flush, VIEW_SAVE_DEBOUNCE_MS);
};

export { scheduleViewSave };
