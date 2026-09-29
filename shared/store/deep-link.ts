/* @layer shared-store @kind logic */
/**
 * The store's install link, `relic-of-the-past://install/<docId>` with an optional `?v=<n>`. The
 * link type is the app's name, since browsers show it when they ask to open the app. It arrives from
 * the OS (a new process's argv, or the hand-off pipe), so the parser accepts that exact shape
 * and nothing else: no other host, path segment, query key or fragment. One trailing slash
 * before the query is tolerated, since some launchers append one to a custom-scheme URL.
 *
 * The item id follows Firestore's document id rules, narrowed to the characters an id this
 * store creates can hold: letters, digits, `_` and `-`, at most 128, never `__...__`.
 */

type InstallLink = {
  itemId: string;
  /** A specific version's `n`; null installs the live version. */
  version: number | null;
};

/** The link type the app registers with the OS; also in electron-builder.config.js `protocols`. */
const INSTALL_SCHEME = 'relic-of-the-past';
const SCHEME_AND_HOST = `${INSTALL_SCHEME}://install/`;
const MAX_LINK_CHARS = 256;
const MAX_VERSION = 1_000_000;

const DOC_ID_RE = /^[A-Za-z0-9_-]{1,128}$/;
const RESERVED_ID_RE = /^__.*__$/;
const VERSION_QUERY_RE = /^v=([1-9][0-9]{0,6})$/;

const isStoreDocId = (value: string): boolean => DOC_ID_RE.test(value) && !RESERVED_ID_RE.test(value);

const parseVersion = (query: string | undefined): number | null | undefined => {
  if (query === undefined) return null;
  const match = VERSION_QUERY_RE.exec(query);
  if (!match) return undefined;
  const version = Number(match[1]);
  return version <= MAX_VERSION ? version : undefined;
};

/** The link, or null for anything that is not exactly an install link. */
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

const formatInstallLink = (link: InstallLink): string => {
  const { itemId, version } = link;
  if (!isStoreDocId(itemId)) throw new Error(`Not a store item id: ${itemId}`);
  if (version !== null && (!Number.isInteger(version) || version < 1 || version > MAX_VERSION)) {
    throw new Error(`Not a version number: ${version}`);
  }
  return `${SCHEME_AND_HOST}${itemId}${version === null ? '' : `?v=${version}`}`;
};

/** The first argv entry that parses as an install link, for a process the OS started with one. */
const installLinkFromArgv = (argv: readonly string[]): InstallLink | null => {
  for (const arg of argv) {
    const link = parseInstallLink(arg);
    if (link) return link;
  }
  return null;
};

export { INSTALL_SCHEME, parseInstallLink, formatInstallLink, installLinkFromArgv, isStoreDocId };
export type { InstallLink };
