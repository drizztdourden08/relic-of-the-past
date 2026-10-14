/* @layer renderer-lib @kind logic */
import { uiViews } from '@drizztdourden08/brock-react';
import type { ViewKey, ViewSnapshot } from '@drizztdourden08/tessera/data';
import { isViewSnapshot } from '@drizztdourden08/tessera/data';

const loadViewSnapshot = async (key: ViewKey): Promise<ViewSnapshot | undefined> => {
  const stored = await uiViews.read<unknown>(key, undefined);
  return isViewSnapshot(stored) ? stored : undefined;
};

export { loadViewSnapshot };
