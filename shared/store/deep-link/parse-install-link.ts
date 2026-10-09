/* @layer shared-store @kind logic */
import { MAX_LINK_CHARS, SCHEME_AND_HOST } from './deep-link.constants';
import type { InstallLink } from './deep-link.type';
import { isStoreDocId } from './is-store-doc-id';
import { parseVersion } from './parse-version';

const parseInstallLink = (raw: string): InstallLink | null => {
  const link = raw.trim();
  if (link.length > MAX_LINK_CHARS || link.includes('#')) return null;
  if (link.slice(0, SCHEME_AND_HOST.length).toLowerCase() !== SCHEME_AND_HOST) return null;

  const rest = link.slice(SCHEME_AND_HOST.length);
  const queryAt = rest.indexOf('?');
  const path = queryAt === -1 ? rest : rest.slice(0, queryAt);
  const query = queryAt === -1 ? undefined : rest.slice(queryAt + 1);

  const itemId = path.endsWith('/') ? path.slice(0, -1) : path;
  if (!isStoreDocId(itemId)) return null;
  const version = parseVersion(query);
  return version === undefined ? null : { itemId, version };
};

export { parseInstallLink };
