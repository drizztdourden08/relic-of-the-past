/* @layer store-site @kind hook */
import { useCallback, useMemo, useState } from 'react';
import type { ReviewEntry } from '@rotp/hub-contracts';
import { navigate, useSurfaceView, filterRows } from '@rotp/design';
import { listUnsubmitted } from '../../../endpoints/review-endpoints';
import { STORE_VIEWS } from '../../../views/store-views';
import { toReviewRow } from '../../../review/review-row';
import { buildReviewSchema } from '../../../review/review-schema';
import { useReviewQueue } from '../../../review/useReviewQueue';
import { REVIEW_PATH, SCOPES } from './useReviewPage.constants';
import type { ReviewScope } from './useReviewPage.type';

const isListing = (entry: ReviewEntry) => entry.target.kind === 'listing';

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
