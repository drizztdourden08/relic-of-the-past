/* @layer renderer-lib @kind logic */
import { getPlatform } from '@drizztdourden08/brock-react';
import type { ViewSnapshot } from '@drizztdourden08/tessera/data';
import { isViewSnapshot } from '@drizztdourden08/tessera/data';
import { log } from '../../log-bus';
import { DATA_VIEWS_FILE } from './ui-views.constants';
import { viewCache } from './view-cache';

const sanitize = (raw: unknown): Record<string, ViewSnapshot> => {
  const map: Record<string, ViewSnapshot> = {};
  if (typeof raw !== 'object' || raw === null) return map;
  for (const [key, value] of Object.entries(raw)) {
    if (isViewSnapshot(value)) map[key] = value;
  }
  return map;
};

const readViews = async (): Promise<Record<string, ViewSnapshot>> => {
  const text = await getPlatform().files.readText(DATA_VIEWS_FILE);
  return text ? sanitize(JSON.parse(text)) : {};
};

const loadAllViews = (): Promise<Record<string, ViewSnapshot>> => {
  if (viewCache.map) return Promise.resolve(viewCache.map);
  if (!viewCache.loading) {
    viewCache.loading = readViews()
      .then((map) => {
        viewCache.map = map;
        return map;
      })
      .catch((error: unknown) => {
        log.ipc(`Failed to load ${DATA_VIEWS_FILE}: ${String(error)}`, 'error');
        const map: Record<string, ViewSnapshot> = {};
        viewCache.map = map;
        return map;
      });
  }
  return viewCache.loading;
};

export { loadAllViews };
