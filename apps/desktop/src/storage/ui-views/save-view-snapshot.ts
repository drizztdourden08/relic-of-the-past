/* @layer renderer-lib @kind logic */
import { uiViews } from '@drizztdourden08/brock-react';
import type { ViewKey, ViewSnapshot } from '@drizztdourden08/tessera/data';
import { log } from '../../log-bus';

const saveViewSnapshot = (key: ViewKey, snapshot: ViewSnapshot): void => {
  void uiViews.write(key, snapshot).catch((error: unknown) => {
    log.ipc(`Failed to save the ${key} view: ${String(error)}`, 'error');
  });
};

export { saveViewSnapshot };
