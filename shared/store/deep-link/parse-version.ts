/* @layer shared-store @kind logic */
import { MAX_VERSION, VERSION_QUERY_RE } from './deep-link.constants';

const parseVersion = (query: string | undefined): number | null | undefined => {
  if (query === undefined) return null;
  const match = VERSION_QUERY_RE.exec(query);
  if (!match) return undefined;
  const version = Number(match[1]);
  return version <= MAX_VERSION ? version : undefined;
};

export { parseVersion };
