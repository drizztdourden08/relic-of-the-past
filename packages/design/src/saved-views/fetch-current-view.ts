/* @layer site-kit @kind logic */
import { isViewSnapshot } from '@drizztdourden08/tessera/data';
import type { ViewSnapshot } from '@drizztdourden08/tessera/data';
import { listViews } from '@rotp/hub-client';
import type { ViewKeys } from './create-view-keys.type';

const fetchCurrentView = async (keys: ViewKeys, surface: string): Promise<ViewSnapshot | undefined> => {
  const { views } = await listViews(surface);
  const hit = views.find((view) => view.id === keys.currentViewId(surface));
  return hit && isViewSnapshot(hit.snapshot) ? hit.snapshot : undefined;
};

export { fetchCurrentView };
