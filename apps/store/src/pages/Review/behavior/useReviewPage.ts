/* @layer store-site @kind hook */
/**
 * All of the review page's state: the queue and its tab (versions or listing edits), the
 * rows with their schema and view, the picked entry and the actions on it. Picking is the
 * route: `/review/:rowId`.
 */
import { useCallback, useMemo, useState } from 'react';
import type { ReviewEntry } from '@shared/store/api-types';
import { navigate } from '@site-kit/router/useLocation';
import { useSurfaceView } from '@site-kit/views/useSurfaceView';
import { filterRows } from '@site-kit/views/filter-rows';
import { STORE_VIEWS } from '../../../views/store-views';
import { entryId, toReviewRow } from '../../../review/review-row';
import { buildReviewSchema } from '../../../review/review-schema';
import { useReviewQueue } from '../../../review/useReviewQueue';
import { useReviewActions } from './useReviewActions';

const REVIEW_PATH = '/review';

const SCOPES = [
  { id: 'versions', label: 'Versions', kind: 'version' },
  { id: 'listings', label: 'Listing edits', kind: 'listing' },
] as const;

const inScope = (scopeId: string) => (entry: ReviewEntry) =>
  entry.target.kind === (SCOPES.find((scope) => scope.id === scopeId) ?? SCOPES[0]).kind;

const useReviewPage = (selectedId: string | null) => {
  const queue = useReviewQueue();
  const [scopeId, setScopeId] = useState<string>(SCOPES[0].id);

  const entries = useMemo(() => queue.entries.filter(inScope(scopeId)), [queue.entries, scopeId]);
  const rows = useMemo(() => entries.map(toReviewRow), [entries]);
  const allRows = useMemo(() => queue.entries.map(toReviewRow), [queue.entries]);
  const schema = useMemo(() => buildReviewSchema(allRows), [allRows]);
  const view = useSurfaceView(STORE_VIEWS, 'review', schema);
  const shown = useMemo(
    () => filterRows({ rows, schema, clauses: view.clauses, search: view.search }),
    [rows, schema, view.clauses, view.search],
  );

  const tabs = useMemo(() => ({
    items: SCOPES.map((scope) => ({ id: scope.id, label: scope.label, badge: queue.entries.filter(inScope(scope.id)).length })),
    activeId: scopeId,
    onSelect: setScopeId,
  }), [queue.entries, scopeId]);

  const selected = useMemo(() => queue.entries.find((entry) => entryId(entry) === selectedId) ?? null, [queue.entries, selectedId]);
  const select = useCallback((id: string) => navigate(`${REVIEW_PATH}/${encodeURIComponent(id)}`, { replace: true }), []);
  const deselect = useCallback(() => navigate(REVIEW_PATH, { replace: true }), []);
  const actions = useReviewActions({ queue, onSettled: deselect });

  const counts = `oldest first · ${allRows.filter((row) => row.change !== 'listing edit').length} versions · ${allRows.filter((row) => row.change === 'listing edit').length} listing edits`;

  return { queue, tabs, schema, view, shown, selected, select, deselect, actions, counts };
};

export { useReviewPage };
