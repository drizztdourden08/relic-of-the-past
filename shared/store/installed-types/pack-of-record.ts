/* @layer shared-store @kind logic */
import { KIND_CONTAINER } from '../containers';
import type { InstalledPack, InstalledRecordView } from './installed-types.type';
import { isInstalledOrigin } from './is-installed-origin';
import { isStoreKind } from './is-store-kind';

const packOfRecord = (record: InstalledRecordView): InstalledPack | null => {
  const { itemId, version, label, container, kind, installedName, installedAt, meta } = record;
  const origin = { name: label, author: meta.author, license: meta.license };
  if (!isStoreKind(kind) || KIND_CONTAINER[kind] !== container) return null;
  if (typeof meta.semver !== 'string' || !isInstalledOrigin(origin)) return null;
  return { itemId, kind, version, semver: meta.semver, container: KIND_CONTAINER[kind], installedName, installedAt, origin };
};

export { packOfRecord };
