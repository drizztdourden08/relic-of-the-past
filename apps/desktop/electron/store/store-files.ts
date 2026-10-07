/* @layer electron-main @kind logic */
/**
 * The Data root the Hookshop installs into, and the one installed registry every install and
 * uninstall shares, so its write queue covers them all.
 */
import { createNodeFileStore } from '../lib/node-file-store';
import { createInstalledRegistry } from './installed-registry';

const storeFiles = createNodeFileStore();

const installedRegistry = createInstalledRegistry(storeFiles);

export { storeFiles, installedRegistry };
