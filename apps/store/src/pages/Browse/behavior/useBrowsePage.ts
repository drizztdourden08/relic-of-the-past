/* @layer store-site @kind hook */
/**
 * All of Browse's state, so the component stays a layout: the catalogue narrowed to the
 * kind the route names, the kind tabs, the view over the browse surface (clauses, search,
 * sort, saved views), the items shown in order, and the picked item with its full record.
 * Picking is the route: `/browse/:id` or `/<kind>/:id`.
 */
import { useCallback, useMemo } from 'react';
import type { StoreKind } from '@shared/store/types';
import { navigate } from '@site-kit/router/useLocation';
import { useSurfaceView } from '@site-kit/views/useSurfaceView';
import { filterRows } from '@site-kit/views/filter-rows';
import { useStoreData } from '../../../data/store-data-context';
import { STORE_VIEWS } from '../../../views/store-views';
import { toItemRow } from '../../../catalog/item-row';
import { buildItemSchema } from '../../../catalog/item-schema';
import { useItem } from '../../../catalog/useItem';
import { kindTabs, tabIdOf, tabPath } from './kind-tabs';
import { useGridSort } from './useGridSort';

const useBrowsePage = (kind: StoreKind | null, selectedId: string | null) => {
  const { catalog } = useStoreData();
  const listPath = tabPath(tabIdOf(kind));

  const inKind = useMemo(
    () => (kind ? catalog.items.filter((item) => item.kind === kind) : catalog.items),
    [catalog.items, kind],
  );
  const allRows = useMemo(() => catalog.items.map(toItemRow), [catalog.items]);
  const rows = useMemo(() => inKind.map(toItemRow), [inKind]);
  const schema = useMemo(() => buildItemSchema(allRows), [allRows]);
  const view = useSurfaceView(STORE_VIEWS, 'browse', schema);
  const sort = useGridSort(view.tableKey, schema, view.storage);

  const shown = useMemo(() => {
    const byId = new Map(inKind.map((item) => [item.id, item]));
    const kept = sort.sortRows(filterRows({ rows, schema, clauses: view.clauses, search: view.search }));
    return kept.flatMap((row) => byId.get(row.id) ?? []);
  }, [inKind, rows, schema, view.clauses, view.search, sort]);

  const tabs = useMemo(() => kindTabs(catalog.items), [catalog.items]);
  const selectTab = useCallback((id: string) => navigate(tabPath(id)), []);

  const selected = useMemo(() => catalog.items.find((item) => item.id === selectedId) ?? null, [catalog.items, selectedId]);
  const detail = useItem(selected ? selected.id : null);
  const itemPathIn = useCallback((item: { id: string }) => `${listPath}/${encodeURIComponent(item.id)}`, [listPath]);
  const deselect = useCallback(() => navigate(listPath, { replace: true }), [listPath]);

  return {
    catalog,
    tabs: { items: tabs, activeId: tabIdOf(kind), onSelect: selectTab },
    schema,
    view,
    sort,
    shown,
    selected,
    detail: detail.data,
    itemPathIn,
    deselect,
  };
};

export { useBrowsePage };
