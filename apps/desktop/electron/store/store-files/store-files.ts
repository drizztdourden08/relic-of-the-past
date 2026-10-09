/* @layer electron-main @kind logic */
import { createNodeFileStore } from '../../lib/node-file-store';

const storeFiles = createNodeFileStore();

export { storeFiles };
