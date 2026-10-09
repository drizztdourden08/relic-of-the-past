/* @layer electron-main @kind logic */
import { isContainer } from '@shared/store/containers';
import type { InstalledPack } from '@shared/store/installed-types';
import { PACK_KINDS } from './installed-registry.constants';
import { isInstalledOrigin } from './is-installed-origin';
import { isRecord } from './is-record';

const isInstalledPack = (value: unknown): value is InstalledPack => {
  if (!isRecord(value)) return false;
  const pack = value;
  return typeof pack.itemId === 'string'
    && PACK_KINDS.includes(pack.kind as string)
    && typeof pack.version === 'number'
    && typeof pack.semver === 'string'
    && isContainer(pack.container)
    && typeof pack.installedName === 'string'
    && pack.installedName.length > 0
    && typeof pack.installedAt === 'number'
    && isInstalledOrigin(pack.origin);
};

export { isInstalledPack };
