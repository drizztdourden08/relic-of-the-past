/* @layer renderer-lib @kind logic */
import type { ViewKey, ViewSnapshot } from '@ds/data';
import { loadAllViews } from './load-all-views';
import { scheduleViewSave } from './schedule-view-save';
import { viewCache } from './view-cache';

const applyMutation = (key: ViewKey, snapshot: ViewSnapshot): void => {
  if (!viewCache.map) viewCache.map = {};
  viewCache.map[key] = snapshot;
  scheduleViewSave();
};

const saveViewSnapshot = (key: ViewKey, snapshot: ViewSnapshot): void => {
  if (viewCache.map) {
    applyMutation(key, snapshot);
    return;
  }
  void loadAllViews().then(() => applyMutation(key, snapshot));
};

export { saveViewSnapshot };
