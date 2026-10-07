/* @layer electron-main @kind logic */
/**
 * Character sprites (.rsp) and language sets (.rlang) opened from the desktop. Each goes
 * through the same shared installer the Hookshop uses, so an opened file and a store install
 * land the same way, under a name nothing else has. A language set is baked into the game
 * assets after, so it can be picked at once. The file's size is held to the Hookshop's cap
 * for its kind before it is read.
 */
import { readFile, stat } from 'fs/promises';
import { basename } from 'path';
import { CONTAINER_KIND } from '@shared/store/containers';
import { selectInstaller } from '@shared/store/install/select-installer';
import { STORE_LIMITS } from '@shared/store/limits';
import type { Container } from '@shared/store/types';
import { recompileAllAssets } from '../assets/compile-rom-assets';
import { createNodeFileStore } from '../lib/node-file-store';
import { logToRenderer } from '../lib/renderer-log';

type OpenedContainer = Extract<Container, 'rsp' | 'rlang'>;

const files = createNodeFileStore();

const importDocument = async (path: string, container: OpenedContainer): Promise<void> => {
  const { size } = await stat(path);
  if (size > STORE_LIMITS.packBytes[CONTAINER_KIND[container]]) throw new Error('the file is larger than a pack may be');
  const bytes = new Uint8Array(await readFile(path));
  const { installedName } = await selectInstaller(container).install(bytes, files, () => undefined);
  if (container === 'rlang') await recompileAllAssets();
  logToRenderer('app', 'info', `Imported ${basename(path)} as "${installedName}"`);
};

/** Logs the outcome; an opened file that cannot be imported never stops the app. */
const importOpenedDocument = (path: string, container: OpenedContainer): void => {
  importDocument(path, container).catch((err: unknown) => {
    const message = err instanceof Error ? err.message : String(err);
    logToRenderer('error', 'error', `Could not import ${basename(path)}: ${message}`);
  });
};

export { importOpenedDocument };
export type { OpenedContainer };
