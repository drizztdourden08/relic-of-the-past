/* @layer electron-main @kind logic */
import { createInstalledRegistry } from '../installed-registry';
import { storeFiles } from './store-files';

const installedRegistry = createInstalledRegistry(storeFiles);

export { installedRegistry };
