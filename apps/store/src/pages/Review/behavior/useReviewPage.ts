/* @layer store-site @kind hook */
/**
 * All of the review page's state: the queue and the versions not submitted yet, the tab
 * (versions, listing edits, not submitted), the rows with their schema and view, the picked
 * entry and the actions on it. Picking is the route: `/review/:rowId`.
 */
import { useCallback, useMemo, useState } from 'react';
import type { ReviewEntry } from '@shared/store/api-types';
import { navigate } from '@site-kit/router/useLocation';
import { useSurfaceView } from '@site-kit/views/useSurfaceView';
import { filterRows } from '@site-kit/views/filter-rows';
import { listUnsubmitted } from '../../../api/review-endpoints';
import { STORE_VIEWS } from '../../../views/store-views';
import { entryId, toReviewRow } from '../../../review/review-row';
import { buildReviewSchema } from '../../../review/review-schema';
import { useReviewQueue } from '../../../review/useReviewQueue';
import { useReviewActions } from './useReviewActions';

const REVIEW_PATH = '/review';

type ReviewScope = 'versions' | 'listings' | 'unsubmitted';

const SCOPES: readonly { id: ReviewScope; label: string }[] = [
  { id: 'versions', label: 'Versions' },
  { id: 'listings', label: 'Listing edits' },
  { id: 'unsubmitted', label: 'Not submitted' },
];

const isListing = (entry: ReviewEntry) => entry.target.kind === 'listing';

const useReviewPage = (selectedId: string | null) => {
  const queue = useReviewQueue();
  const unsubmitted = useReviewQueue(listUnsubmitted);
  const [scopeId, setScopeId] = useState<ReviewScope>('versions');

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
  }), [byScope, scopeId]);

  const selected = useMemo(
    () => [...queue.entries, ...unsubmitted.entries].find((entry) => entryId(entry) === selectedId) ?? null,
    [queue.entries, unsubmitted.entries, selectedId],
  );
  const select = useCallback((id: string) => navigate(`${REVIEW_PATH}/${encodeURIComponent(id)}`, { replace: true }), []);
  const deselect = useCallback(() => navigate(REVIEW_PATH, { replace: true }), []);
  const { removeEntry: dropQueued } = queue;
  const { removeEntry: dropUnsubmitted } = unsubmitted;
  const onRemoved = useCallback((id: string) => { dropQueued(id); dropUnsubmitted(id); }, [dropQueued, dropUnsubmitted]);
  const actions = useReviewActions({ onRemoved, onSettled: deselect });

  const counts = `oldest first · ${byScope.versions.length} versions · ${byScope.listings.length} listing edits · ${byScope.unsubmitted.length} not submitted`;
  const loading = scopeId === 'unsubmitted' ? unsubmitted.loading : queue.loading;
  const error = queue.error ?? unsubmitted.error;

  return { scopeId, loading, error, tabs, schema, view, shown, selected, select, deselect, actions, counts };
};

export { useReviewPage };
export type { ReviewScope };
