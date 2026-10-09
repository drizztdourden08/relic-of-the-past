/* @layer electron-main @kind logic */
import { handle } from '@drizztdourden08/brock-electron/main';
import { fetchHome, fetchItem, fetchItems } from './catalog';
import { duplicateInstalled } from './duplicate';
import { cancelJob } from './install-jobs';
import { runInstall, runUninstall } from './run-install';
import { installedRegistry } from './store-files';
import { toStoreResult } from './store-result';

const registerStoreHandlers = (): void => {
  handle('store:home', () => toStoreResult(fetchHome));
  handle('store:items', (_event, kind) => toStoreResult(() => fetchItems(kind)));
  handle('store:item', (_event, itemId) => toStoreResult(() => fetchItem(itemId)));
  handle('store:installed', () => installedRegistry.list());
  handle('store:install', (_event, request) => runInstall(request));
  handle('store:uninstall', (_event, itemId) => runUninstall(itemId));
  handle('store:duplicate', (_event, itemId) => toStoreResult(() => duplicateInstalled(itemId)));
  handle('store:cancel', async (_event, itemId) => { cancelJob(itemId); });
};

export { registerStoreHandlers };
