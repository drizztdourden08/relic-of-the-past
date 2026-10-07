/* @layer site-kit @kind logic */
/**
 * The view keys of one site, `<prefix>:<surface>[.query][~<nonce>]`. One surface has two
 * halves bound to the same server record: the table half (columns, sort, group by), owned
 * by the DataTable, and the query half (filter clauses), owned by the page. The nonce is
 * bumped when a saved view is applied, so both halves reload from the storage cache.
 */
import type { ViewKey } from '@ds/data/view-state/snapshot';

type ViewHalf = 'table' | 'query';

type ParsedViewKey = { surface: string; half: ViewHalf };

type ViewKeys = {
  surfaces: readonly string[];
  keyFor: (surface: string, half: ViewHalf, nonce?: number) => ViewKey;
  parse: (key: ViewKey) => ParsedViewKey | null;
  /** The reserved id of the surface's live arrangement, one per surface since view ids are global. */
  currentViewId: (surface: string) => string;
  isCurrentViewId: (id: string) => boolean;
};

const QUERY_SUFFIX = '.query';
const CURRENT_PREFIX = 'current-';

const createViewKeys = (prefix: string, surfaces: readonly string[]): ViewKeys => {
  const pattern = new RegExp(`^${prefix}:(${surfaces.join('|')})(\\.query)?(?:~\\d+)?$`);
  return {
    surfaces,
    keyFor: (surface, half, nonce = 0) =>
      `${prefix}:${surface}${half === 'query' ? QUERY_SUFFIX : ''}${nonce ? `~${nonce}` : ''}`,
    parse: (key) => {
      const match = pattern.exec(key);
      return match ? { surface: match[1], half: match[2] ? 'query' : 'table' } : null;
    },
    currentViewId: (surface) => `${CURRENT_PREFIX}${surface}`,
    isCurrentViewId: (id) => id.startsWith(CURRENT_PREFIX),
  };
};

export { createViewKeys };
export type { ViewKeys, ViewHalf, ParsedViewKey };
