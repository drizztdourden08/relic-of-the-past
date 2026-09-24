/* @layer sanctuary-site @kind logic */
/**
 * The view keys of the site, `sanctuary:<surface>[.query][~<nonce>]`. One surface has two
 * halves bound to the same server record: the table half (columns, sort, group by), owned
 * by the DataTable, and the query half (filter clauses), owned by the page. The nonce is
 * bumped when a saved view is applied, so both halves reload from the storage cache.
 */
import type { ViewSurface } from '@shared/sanctuary/types';
import type { ViewKey } from '@ds/data/view-state/snapshot';

type ViewHalf = 'table' | 'query';

type ParsedViewKey = { surface: ViewSurface; half: ViewHalf };

const PREFIX = 'sanctuary';
const QUERY_SUFFIX = '.query';
const KEY_PATTERN = /^sanctuary:(files|reports)(\.query)?(?:~\d+)?$/;

const viewKeyFor = (surface: ViewSurface, half: ViewHalf, nonce = 0): ViewKey =>
  `${PREFIX}:${surface}${half === 'query' ? QUERY_SUFFIX : ''}${nonce ? `~${nonce}` : ''}`;

const parseViewKey = (key: ViewKey): ParsedViewKey | null => {
  const match = KEY_PATTERN.exec(key);
  if (!match) return null;
  return { surface: match[1] as ViewSurface, half: match[2] ? 'query' : 'table' };
};

/** The reserved id of the surface's live arrangement, one per surface since view ids are global. */
const currentViewId = (surface: ViewSurface) => `current-${surface}`;

const isCurrentViewId = (id: string) => id.startsWith('current-');

export { viewKeyFor, parseViewKey, currentViewId, isCurrentViewId };
export type { ViewHalf, ParsedViewKey };
