/* @layer renderer-components @kind logic */
/**
 * Pure column-list transforms. Every one takes the current list and returns a
 * new one, so the hook stays a thin binding over them and the behaviour is
 * testable without React.
 */
import type { ColumnMove, TableColumn } from './types';

const indexOfColumn = (columns: readonly TableColumn[], path: string): number =>
  columns.findIndex((column) => column.path === path);

/** Appending a column already present is a no-op, not a duplicate. */
const addColumn = (columns: readonly TableColumn[], path: string): readonly TableColumn[] =>
  indexOfColumn(columns, path) === -1 ? [...columns, { path, fit: true }] : columns;

/**
 * The same add, at a chosen slot instead of the end. This is what "add a column
 * before / after this one" means. `at` is the index the new column ENDS UP at,
 * so inserting before column N is `at = N` and after it is `at = N + 1`;
 * `at = length` is the plain append.
 *
 * Clamped, not rejected: a menu built against a column list that has
 * since shrunk should still put the column somewhere sensible.
 */
const insertColumnAt = (
  columns: readonly TableColumn[],
  path: string,
  at: number,
): readonly TableColumn[] => {
  if (indexOfColumn(columns, path) !== -1) return columns;
  const next = [...columns];
  next.splice(Math.min(Math.max(at, 0), columns.length), 0, { path, fit: true });
  return next;
};

const removeColumn = (columns: readonly TableColumn[], path: string): readonly TableColumn[] =>
  columns.filter((column) => column.path !== path);

const targetIndex = (from: number, move: ColumnMove, length: number): number => {
  if (move === 'first') return 0;
  if (move === 'last') return length - 1;
  const to = move === 'left' ? from - 1 : from + 1;
  return Math.min(Math.max(to, 0), length - 1);
};

const moveColumn = (
  columns: readonly TableColumn[],
  path: string,
  move: ColumnMove,
): readonly TableColumn[] => {
  const from = indexOfColumn(columns, path);
  if (from === -1) return columns;
  const to = targetIndex(from, move, columns.length);
  if (to === from) return columns;
  const next = [...columns];
  const [moved] = next.splice(from, 1);
  next.splice(to, 0, moved);
  return next;
};

/** Drop-target reorder for a drag: place `path` at `to`, shifting the rest. */
const reorderColumn = (
  columns: readonly TableColumn[],
  path: string,
  to: number,
): readonly TableColumn[] => {
  const from = indexOfColumn(columns, path);
  if (from === -1 || to < 0 || to >= columns.length || to === from) return columns;
  const next = [...columns];
  const [moved] = next.splice(from, 1);
  next.splice(to, 0, moved);
  return next;
};

/** An empty rename clears the override and falls back to the schema label. */
const renameColumn = (
  columns: readonly TableColumn[],
  path: string,
  label: string,
): readonly TableColumn[] =>
  columns.map((column) => {
    if (column.path !== path) return column;
    const next: TableColumn = { ...column };
    if (label) next.label = label;
    else delete next.label;
    return next;
  });

/**
 * Which field of the referenced record a reference column shows. An empty or
 * absent choice clears the override and the column goes back to the raw id. That
 * is the same "unset by writing nothing" rule the rename above follows, for the
 * same reason: a leftover key would read as a layout change in a snapshot.
 */
const setDisplayField = (
  columns: readonly TableColumn[],
  path: string,
  displayField: string | undefined,
): readonly TableColumn[] =>
  columns.map((column) => {
    if (column.path !== path) return column;
    const next: TableColumn = { ...column };
    if (displayField) next.displayField = displayField;
    else delete next.displayField;
    return next;
  });

/*
 * A width, a grow flag and a fit flag are one setting in three forms, so
 * writing any one of them clears the other two instead of leaving a stale key
 * behind. A snapshot is compared as JSON, and a leftover `grow: false` would
 * read as a layout change.
 */
const withWidth = (column: TableColumn, width: number): TableColumn => {
  const next: TableColumn = { ...column, width };
  delete next.grow;
  delete next.fit;
  return next;
};

const withGrow = (column: TableColumn): TableColumn => {
  const next: TableColumn = { ...column, grow: true };
  delete next.width;
  delete next.fit;
  return next;
};

/** "Fit to content" as a MODE: the column keeps re-measuring itself instead of freezing at one width. */
const withFit = (column: TableColumn): TableColumn => {
  const next: TableColumn = { ...column, fit: true };
  delete next.width;
  delete next.grow;
  return next;
};

const resizeColumn = (
  columns: readonly TableColumn[],
  path: string,
  width: number,
): readonly TableColumn[] =>
  columns.map((column) => (column.path === path ? withWidth(column, width) : column));

/** "Expand to available space": the column becomes the row's flexible track. */
const growColumn = (columns: readonly TableColumn[], path: string): readonly TableColumn[] =>
  columns.map((column) => (column.path === path ? withGrow(column) : column));

/** Turns on persistent fit-to-content for one column. */
const fitColumn = (columns: readonly TableColumn[], path: string): readonly TableColumn[] =>
  columns.map((column) => (column.path === path ? withFit(column) : column));

/** The footer's "fit all to content", applied to every visible column at once. */
const fitAllColumns = (columns: readonly TableColumn[]): readonly TableColumn[] =>
  columns.map(withFit);

export {
  addColumn, fitAllColumns, fitColumn, growColumn, indexOfColumn, insertColumnAt, moveColumn,
  removeColumn, renameColumn, reorderColumn, resizeColumn, setDisplayField,
};
