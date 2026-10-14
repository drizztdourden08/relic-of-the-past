/* @layer site-kit @kind logic */
import type { ViewSnapshot } from '@drizztdourden08/tessera/data';
import { putView } from '@rotp/hub-client';
import { CURRENT_NAME } from './create-view-storage.constants';
import type { ViewKeys } from './create-view-keys.type';

const putCurrentView = (keys: ViewKeys, surface: string, snapshot: ViewSnapshot): Promise<void> =>
  putView(keys.currentViewId(surface), { surface, name: CURRENT_NAME, snapshot }).then(
    () => undefined,
    (error: unknown) => console.warn(`Saving the ${surface} view failed: ${String(error)}`),
  );

export { putCurrentView };
