/* @layer renderer-components @kind logic */
/**
 * Memento: a plain, serialisable snapshot of everything a user arranged, and
 * the reverse translation back into the state the table and filter bar accept.
 *
 * Plain data in, plain data out — nothing here knows a disk or a store exists.
 * Binding a snapshot to storage is somebody else's job, which is what keeps the
 * composites reusable in a surface that wants purely-ephemeral layout.
 */
import type { FilterClause } from '../filter/clause';
import type { SortEntry, TableColumn, TableState } from '../table/types';

/** Bump to discard stale snapshots rather than migrate them. */
const SNAPSHOT_VERSION = 1;

type DetailTab = 'json' | 'ts' | 'editor';

interface ViewSnapshot {
  v: 1;
  columns: readonly TableColumn[];
  sort: readonly SortEntry[];
  groupBy: readonly string[];
  filters: readonly FilterClause[];
  tab?: DetailTab;
}

interface RestoredView {
  table: TableState;
  filters: readonly FilterClause[];
  tab?: DetailTab;
}

/**
 * Keyed by SURFACE + COLLECTION ('data-inspector:screen' vs 'nav-widget:connection'),
 * so the same collection viewed in two different surfaces keeps independent layouts.
 */
type ViewKey = `${string}:${string}`;
type ViewStore = Record<ViewKey, ViewSnapshot>;

const capture = (
  table: TableState,
  filters: readonly FilterClause[],
  tab?: DetailTab,
): ViewSnapshot => {
  const snapshot: ViewSnapshot = {
    v: SNAPSHOT_VERSION,
    columns: table.columns.map((column) => ({ ...column })),
    sort: table.sort.map((entry) => ({ ...entry })),
    groupBy: [...table.groupBy],
    filters: filters.map((clause) => ({ ...clause })),
  };
  if (tab !== undefined) snapshot.tab = tab;
  return snapshot;
};

/** The inverse of capture: hand `table` to DataTableState.setState and `filters` to the filter bar. */
const restore = (snapshot: ViewSnapshot): RestoredView => {
  const view: RestoredView = {
    table: {
      columns: snapshot.columns.map((column) => ({ ...column })),
      sort: snapshot.sort.map((entry) => ({ ...entry })),
      groupBy: [...snapshot.groupBy],
    },
    filters: snapshot.filters.map((clause) => ({ ...clause })),
  };
  if (snapshot.tab !== undefined) view.tab = snapshot.tab;
  return view;
};

const emptySnapshot = (): ViewSnapshot => ({
  v: SNAPSHOT_VERSION,
  columns: [],
  sort: [],
  groupBy: [],
  filters: [],
});

const isArrayOfObjects = (value: unknown): boolean =>
  Array.isArray(value) && value.every((entry) => typeof entry === 'object' && entry !== null);

/**
 * Snapshots arrive from untrusted JSON, and a wrong-shaped one must be dropped
 * rather than crash a screen. A version mismatch fails here by design.
 */
const isViewSnapshot = (value: unknown): value is ViewSnapshot => {
  if (typeof value !== 'object' || value === null) return false;
  const candidate = value as Partial<ViewSnapshot>;
  return (
    candidate.v === SNAPSHOT_VERSION &&
    isArrayOfObjects(candidate.columns) &&
    isArrayOfObjects(candidate.sort) &&
    Array.isArray(candidate.groupBy) &&
    candidate.groupBy.every((path) => typeof path === 'string') &&
    isArrayOfObjects(candidate.filters)
  );
};

export { SNAPSHOT_VERSION, capture, emptySnapshot, isViewSnapshot, restore };
export type { DetailTab, RestoredView, ViewKey, ViewSnapshot, ViewStore };
