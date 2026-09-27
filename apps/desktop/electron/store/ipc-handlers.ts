/* @layer electron-main @kind logic */
/**
 * The Hookshop channels. Every read goes to the store API with the device token from the
 * main process; install and uninstall run here too, so the renderer holds neither the token
 * nor a download URL.
 */
import { handle } from '../lib/ipc/handle';
import { fetchHome, fetchItem, fetchItems } from './catalog';
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
  handle('store:cancel', async (_event, itemId) => { cancelJob(itemId); });
};

export { registerStoreHandlers };
