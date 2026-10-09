/* @layer store-site @kind hook */
import { useCallback, useMemo } from 'react';
import { useViewState } from '@ds/data/view-state/use-view-state';
import { capture } from '@ds/data/view-state/snapshot';
import type { SchemaLike } from '@ds/data/schema/build-schema';
import type { ViewKey } from '@ds/data/view-state/snapshot';
import type { ViewStorage } from '@ds/data/view-state/use-view-state';
import { ITEM_SORTS } from '../../../catalog/item-schema';
import type { ItemRow } from '../../../catalog/item-row';
import { DEFAULT_SORT, NO_COLUMNS } from './useGridSort.constants';

const compareRows = (path: keyof ItemRow, dir: 'asc' | 'desc') => (a: ItemRow, b: ItemRow): number => {
  const left = a[path];
  const right = b[path];
  const order = typeof left === 'number' && typeof right === 'number'
    ? left - right
    : String(left).localeCompare(String(right));
  return dir === 'asc' ? order : -order;
};

const useGridSort = (tableKey: ViewKey, schema: SchemaLike, storage: ViewStorage) => {
  const { snapshot, setSnapshot } = useViewState(tableKey, schema, NO_COLUMNS, undefined, storage);
  const stored = snapshot.sort[0];
  const active = ITEM_SORTS.find((sort) => sort.entry.path === stored?.path && sort.entry.dir === stored?.dir) ?? DEFAULT_SORT;

  const setSortId = useCallback((id: string) => {
    const next = ITEM_SORTS.find((sort) => sort.id === id) ?? DEFAULT_SORT;
    setSnapshot(capture({ columns: [], sort: [next.entry], groupBy: [] }, snapshot.filters));
  }, [setSnapshot, snapshot.filters]);

  const sortRows = useCallback(
    (rows: readonly ItemRow[]) => [...rows].sort(compareRows(active.entry.path as keyof ItemRow, active.entry.dir)),
    [active],
  );

  const options = useMemo(() => ITEM_SORTS.map((sort) => ({ value: sort.id, label: sort.label })), []);

  return { sortId: active.id, setSortId, sortRows, options };
};

export { useGridSort };
