/* @layer renderer-lib @kind logic */
import type { ViewSnapshot } from '@ds/data';
import { isViewSnapshot } from '@ds/data';
import { log } from '../../log-bus';
import { viewCache } from './view-cache';

const sanitize = (raw: Record<string, unknown>): Record<string, ViewSnapshot> => {
  const map: Record<string, ViewSnapshot> = {};
  for (const [key, value] of Object.entries(raw)) {
    if (isViewSnapshot(value)) map[key] = value;
  }
  return map;
};

const loadAllViews = (): Promise<Record<string, ViewSnapshot>> => {
  if (viewCache.map) return Promise.resolve(viewCache.map);
  if (!viewCache.loading) {
    viewCache.loading = window.api.uiViews.load()
      .then((raw) => {
        const map = sanitize(raw as Record<string, unknown>);
        viewCache.map = map;
        return map;
      })
      .catch((error: unknown) => {
        log.ipc(`Failed to load ui-views.json: ${String(error)}`, 'error');
        const map: Record<string, ViewSnapshot> = {};
        viewCache.map = map;
        return map;
      });
  }
  return viewCache.loading;
};

export { loadAllViews };
