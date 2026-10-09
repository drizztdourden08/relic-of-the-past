/* @layer electron-main @kind logic */
import { readFile, rm } from 'fs/promises';
import { STORE_ROUTES } from '@shared/store/api-contract';
import type { DownloadResponse } from '@shared/store/api-types';
import { selectInstaller } from '@shared/store/install/select-installer';
import type { InstallOutcome, PackInstaller } from '@shared/store/install/installer.type';
import type { StoreKind } from '@shared/store/types';
import type { InstalledPack } from '@shared/store/installed-types';
import { recompileAllAssets } from '../assets/compile-rom-assets';
import { downloadToTempFile } from '../lib/download';
import { assertItemId } from './catalog';
import { callStore } from './store-client';
import { installedRegistry, storeFiles } from './store-files';
import { repointProfiles } from './repoint-profiles';
import { retirePack } from './uninstall';
import { checkGrant, verifyDownload } from './verify-download';
import type { InstallParams } from './install.type';

const cancelledError = (): Error => Object.assign(new Error('The install was cancelled.'), { name: 'AbortError' });

const throwIfCancelledBeforeWriting = (signal: AbortSignal): void => {
  if (signal.aborted) throw cancelledError();
};

const requestGrant = (itemId: string, version: number | null): Promise<DownloadResponse> =>
  callStore<DownloadResponse>({
    route: STORE_ROUTES.download,
    params: { id: assertItemId(itemId) },
    body: version === null ? {} : { version },
  });

const settledName = async (installer: PackInstaller, installed: InstallOutcome, kind: StoreKind): Promise<string> => {
  const { installedName, ownName } = installed;
  if (!installer.settleName || !ownName) return installedName;
  const settled = await installer.settleName(installedName, ownName, storeFiles);
  if (settled !== installedName) await repointProfiles({ kind, installedName }, settled);
  return settled;
};

const downloadPack = async (
  grant: DownloadResponse, onProgress: InstallParams['onProgress'], signal: AbortSignal,
): Promise<Uint8Array> => {
  const reportDownload = (done: number, total?: number) => onProgress({ phase: 'download', done, total: total ?? grant.bytes });
  const path = await downloadToTempFile(grant.url, `.${grant.container}`, reportDownload, signal);
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
  throwIfCancelledBeforeWriting(signal);

  const previous = await installedRegistry.get(itemId);
  const installer = selectInstaller(grant.container);
  const installed = await installer.install(bytes, storeFiles, onProgress);
  if (previous && previous.installedName !== installed.installedName) await retirePack(previous, installed.installedName);
  const installedName = await settledName(installer, installed, grant.kind);
  const pack: InstalledPack = {
    itemId,
    kind: grant.kind,
    version: grant.version,
    semver: grant.semver,
    container: grant.container,
    installedName,
    installedAt: Date.now(),
    origin: { name: grant.name, author: grant.author, license: grant.license },
  };
  await installedRegistry.put(pack);
  if (pack.kind === 'language') await recompileAllAssets();
  return pack;
};

export { installItem };
export type { InstallParams };
