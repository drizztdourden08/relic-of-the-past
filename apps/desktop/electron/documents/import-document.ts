/* @layer electron-main @kind logic */
import { readFile, stat } from 'fs/promises';
import { basename } from 'path';
import { CONTAINER_KIND, STORE_LIMITS } from '@rotp/hub-contracts';
import { selectInstaller } from '@rotp/packs';
import { recompileAllAssets } from '../assets/compile-rom-assets';
import { createNodeFileStore } from '../lib/node-file-store';
import { logToRenderer } from '../lib/renderer-log';
import type { OpenedContainer } from './import-document.type';

const files = createNodeFileStore();

const importDocument = async (path: string, container: OpenedContainer): Promise<void> => {
  const { size } = await stat(path);
  if (size > STORE_LIMITS.packBytes[CONTAINER_KIND[container]]) throw new Error('the file is larger than a pack may be');
  const bytes = new Uint8Array(await readFile(path));
  const { installedName } = await selectInstaller(container).install(bytes, files, () => undefined);
  if (container === 'rlang') await recompileAllAssets();
  logToRenderer('app', 'info', `Imported ${basename(path)} as "${installedName}"`);
};

const importOpenedDocument = (path: string, container: OpenedContainer): void => {
  importDocument(path, container).catch((err: unknown) => {
    const message = err instanceof Error ? err.message : String(err);
    logToRenderer('error', 'error', `Could not import ${basename(path)}: ${message}`);
  });
};

export { importOpenedDocument };
export type { OpenedContainer };
