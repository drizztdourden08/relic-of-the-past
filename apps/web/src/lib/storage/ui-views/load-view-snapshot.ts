/* @layer renderer-lib @kind logic */
import type { ViewKey, ViewSnapshot } from '@ds/data';
import { loadAllViews } from './load-all-views';

const loadViewSnapshot = async (key: ViewKey): Promise<ViewSnapshot | undefined> => {
  const map = await loadAllViews();
  return map[key];
};

export { loadViewSnapshot };
