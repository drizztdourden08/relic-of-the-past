/* @layer store-site @kind hook */
/**
 * All of the Reviewer Hub list's state: the queue and the versions not submitted yet, the
 * tab (versions, listing edits, not submitted), and the rows with their schema and view.
 * Picking a row opens its review page, `/review/:rowId`.
 */
import { useCallback, useMemo, useState } from 'react';
import type { ReviewEntry } from '@shared/store/api-types';
import { navigate } from '@site-kit/router/useLocation';
import { useSurfaceView } from '@site-kit/views/useSurfaceView';
import { filterRows } from '@site-kit/views/filter-rows';
import { listUnsubmitted } from '../../../api/review-endpoints';
import { STORE_VIEWS } from '../../../views/store-views';
import { toReviewRow } from '../../../review/review-row';
import { buildReviewSchema } from '../../../review/review-schema';
import { useReviewQueue } from '../../../review/useReviewQueue';

const REVIEW_PATH = '/review';

type ReviewScope = 'versions' | 'listings' | 'unsubmitted';

const SCOPES: readonly { id: ReviewScope; label: string }[] = [
  { id: 'versions', label: 'Versions' },
  { id: 'listings', label: 'Listing edits' },
  { id: 'unsubmitted', label: 'Not submitted' },
];

const isListing = (entry: ReviewEntry) => entry.target.kind === 'listing';

/** The tab last picked, so coming back from a review page lands on the same tab. */
let lastScope: ReviewScope = 'versions';

const useReviewPage = () => {
  const queue = useReviewQueue();
  const unsubmitted = useReviewQueue(listUnsubmitted);
  const [scopeId, setScope] = useState<ReviewScope>(() => lastScope);
  const setScopeId = useCallback((next: ReviewScope) => {
    lastScope = next;
    setScope(next);
  }, []);

  const byScope = useMemo((): Record<ReviewScope, ReviewEntry[]> => ({
    versions: queue.entries.filter((entry) => !isListing(entry)),
    listings: queue.entries.filter(isListing),
    unsubmitted: unsubmitted.entries,
  }), [queue.entries, unsubmitted.entries]);

  const rows = useMemo(() => byScope[scopeId].map(toReviewRow), [byScope, scopeId]);
  const allRows = useMemo(() => [...queue.entries, ...unsubmitted.entries].map(toReviewRow), [queue.entries, unsubmitted.entries]);
  const schema = useMemo(() => buildReviewSchema(allRows), [allRows]);
  const view = useSurfaceView(STORE_VIEWS, 'review', schema);
  const shown = useMemo(
    () => filterRows({ rows, schema, clauses: view.clauses, search: view.search }),
    [rows, schema, view.clauses, view.search],
  );

  const tabs = useMemo(() => ({
    items: SCOPES.map((scope) => ({ id: scope.id, label: scope.label, badge: byScope[scope.id].length })),
    activeId: scopeId,
    onSelect: (next: string) => setScopeId(next as ReviewScope),
  }), [byScope, scopeId, setScopeId]);

  const open = useCallback((id: string) => navigate(`${REVIEW_PATH}/${encodeURIComponent(id)}`), []);

  const counts = `oldest first · ${byScope.versions.length} versions · ${byScope.listings.length} listing edits · ${byScope.unsubmitted.length} not submitted`;
  const loading = scopeId === 'unsubmitted' ? unsubmitted.loading : queue.loading;
  const error = queue.error ?? unsubmitted.error;

  return { scopeId, loading, error, tabs, schema, view, shown, open, counts };
};

export { useReviewPage };
export type { ReviewScope };
