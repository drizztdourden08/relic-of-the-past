/* @layer store-site @kind hook */
import { useCallback, useMemo } from 'react';
import { useViewState, capture } from '@drizztdourden08/tessera/data';
import type { SchemaLike, ViewKey, ViewStorage } from '@drizztdourden08/tessera/data';
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
  const { snapshot, setSnapshot } = useViewState({ key: tableKey, schema, fallbackColumns: NO_COLUMNS, storage });
  const stored = snapshot.sort.at(0);
  const storedPath = stored?.path;
  const storedDir = stored?.dir;
  const active = ITEM_SORTS.find((sort) => sort.entry.path === storedPath && sort.entry.dir === storedDir) ?? DEFAULT_SORT;

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
