/* @layer electron-main @kind logic */
/**
 * Installing one item: the API grants a download of an approved version, the bytes land in a
 * temp file with progress, the size and sha256 are checked, the container's installer
 * unpacks them, and the registry records what it wrote. Installing an item that is already
 * installed is an update: the new copy goes in first, profiles that used the old copy are
 * pointed at the new one, then the old copy is removed. A language is baked into the game
 * assets after, the way the language editor's save does it.
 */
import { readFile, rm } from 'fs/promises';
import { STORE_ROUTES } from '@shared/store/api-contract';
import type { DownloadResponse } from '@shared/store/api-types';
import { selectInstaller } from '@shared/store/install/select-installer';
import type { InstallProgress } from '@shared/store/install/installer.type';
import type { InstalledPack } from '@shared/store/installed-types';
import { recompileAllAssets } from '../assets/compile-rom-assets';
import { downloadToTemp } from '../lib/download';
import { assertItemId } from './catalog';
import { callStore } from './store-client';
import { installedRegistry, storeFiles } from './store-files';
import { retirePack } from './uninstall';
import { checkGrant, verifyDownload } from './verify-download';

type InstallParams = {
  itemId: string;
  version: number | null;
  onProgress: (progress: InstallProgress) => void;
  signal: AbortSignal;
};

const cancelledError = (): Error => Object.assign(new Error('The install was cancelled.'), { name: 'AbortError' });

const requestGrant = (itemId: string, version: number | null): Promise<DownloadResponse> =>
  callStore<DownloadResponse>({
    route: STORE_ROUTES.download,
    params: { id: assertItemId(itemId) },
    body: version === null ? {} : { version },
  });

const downloadPack = async (
  grant: DownloadResponse, onProgress: InstallParams['onProgress'], signal: AbortSignal,
): Promise<Uint8Array> => {
  const reportDownload = (done: number, total?: number) => onProgress({ phase: 'download', done, total: total ?? grant.bytes });
  const path = await downloadToTemp(grant.url, `.${grant.container}`, reportDownload, signal);
  try {
    return new Uint8Array(await readFile(path));
  } finally {
    await rm(path, { force: true });
  }
};

const installItem = async (params: InstallParams): Promise<InstalledPack> => {
  const { itemId, version, onProgress, signal } = params;
  const grant = await requestGrant(itemId, version);
  checkGrant(grant, itemId);
  onProgress({ phase: 'download', done: 0, total: grant.bytes });
  const bytes = await downloadPack(grant, onProgress, signal);

  onProgress({ phase: 'verify', done: 0, total: 1 });
  verifyDownload(bytes, grant);
  onProgress({ phase: 'verify', done: 1, total: 1 });
  // The last point a cancel is honoured: from here the files are being written.
  if (signal.aborted) throw cancelledError();

  const previous = await installedRegistry.get(itemId);
  const { installedName } = await selectInstaller(grant.container).install(bytes, storeFiles, onProgress);
  const pack: InstalledPack = {
    itemId,
    kind: grant.kind,
    version: grant.version,
    semver: grant.semver,
    container: grant.container,
    installedName,
    installedAt: Date.now(),
  };
  if (previous && previous.installedName !== installedName) await retirePack(previous, installedName);
  await installedRegistry.put(pack);
  if (pack.kind === 'language') await recompileAllAssets();
  return pack;
};

export { installItem };
export type { InstallParams };
