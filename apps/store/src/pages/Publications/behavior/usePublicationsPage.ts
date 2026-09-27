/* @layer store-site @kind hook */
/**
 * All of My publications' state, so the component stays a layout: the player's items and
 * the scope tab, the rows with their schema and view, the totals line, and the picked row
 * with its item and actions. Picking is the route: `/publications/:rowId`.
 */
import { useCallback, useMemo, useState } from 'react';
import { navigate } from '@site-kit/router/useLocation';
import { useSurfaceView } from '@site-kit/views/useSurfaceView';
import { filterRows } from '@site-kit/views/filter-rows';
import { useStoreData } from '../../../data/store-data-context';
import { STORE_VIEWS } from '../../../views/store-views';
import { parseRowId, rowsOfItem } from '../../../publications/publication-row';
import { buildPublicationSchema } from '../../../publications/publication-schema';
import { averageOf, formatAverage, formatCount, plural } from '../../../lib/format-count';
import { publicationTabs, scopePredicate } from './publication-scopes';
import { usePublicationActions } from './usePublicationActions';

const PUBLICATIONS_PATH = '/publications';

const usePublicationsPage = (selectedId: string | null) => {
  const { publications } = useStoreData();
  const { items } = publications;
  const [scopeId, setScopeId] = useState('all');

  const inScope = useMemo(() => items.filter(scopePredicate(scopeId)), [items, scopeId]);
  const rows = useMemo(() => inScope.flatMap(rowsOfItem), [inScope]);
  const allRows = useMemo(() => items.flatMap(rowsOfItem), [items]);
  const schema = useMemo(() => buildPublicationSchema(allRows), [allRows]);
  const view = useSurfaceView(STORE_VIEWS, 'publications', schema);
  const shown = useMemo(
    () => filterRows({ rows, schema, clauses: view.clauses, search: view.search }),
    [rows, schema, view.clauses, view.search],
  );

  const totals = useMemo(() => {
    const installs = items.reduce((sum, item) => sum + item.stats.installs, 0);
    const count = items.reduce((sum, item) => sum + item.stats.ratingCount, 0);
    const ratingSum = items.reduce((sum, item) => sum + item.stats.ratingSum, 0);
    const rating = count ? `${formatAverage(averageOf(ratingSum, count))} average from ${plural(count, 'rating', 'ratings')}` : 'no ratings yet';
    return `${plural(items.length, 'item', 'items')} · ${formatCount(installs)} installs · ${rating}`;
  }, [items]);

  const picked = useMemo(() => {
    const parsed = selectedId ? parseRowId(selectedId) : null;
    const item = parsed ? items.find((entry) => entry.id === parsed.itemId) : undefined;
    return parsed && item ? { item, target: parsed.target } : null;
  }, [items, selectedId]);

  const select = useCallback((id: string) => navigate(`${PUBLICATIONS_PATH}/${encodeURIComponent(id)}`, { replace: true }), []);
  const deselect = useCallback(() => navigate(PUBLICATIONS_PATH, { replace: true }), []);
  const actions = usePublicationActions();
  const tabs = useMemo(() => ({ items: publicationTabs(items), activeId: scopeId, onSelect: setScopeId }), [items, scopeId]);

  return {
    publications,
    tabs,
    schema,
    view,
    shown,
    totals,
    picked,
    select,
    deselect,
    actions,
  };
};

export { usePublicationsPage };
