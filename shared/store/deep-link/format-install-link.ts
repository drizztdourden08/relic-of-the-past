/* @layer shared-store @kind logic */
import { MAX_VERSION, SCHEME_AND_HOST } from './deep-link.constants';
import type { InstallLink } from './deep-link.type';
import { isStoreDocId } from './is-store-doc-id';

const formatInstallLink = (link: InstallLink): string => {
  const { itemId, version } = link;
  if (!isStoreDocId(itemId)) throw new Error(`Not a store item id: ${itemId}`);
  if (version !== null && (!Number.isInteger(version) || version < 1 || version > MAX_VERSION)) {
    throw new Error(`Not a version number: ${version}`);
  }
  return `${SCHEME_AND_HOST}${itemId}${version === null ? '' : `?v=${version}`}`;
};

export { formatInstallLink };
