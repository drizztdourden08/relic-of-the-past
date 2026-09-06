/* @layer renderer-components @kind types */
import type { DragEvent, PointerEvent } from 'react';
import type { SchemaIndex } from '../../data/schema/build-schema';
import type { FieldDescriptor } from '../../data/schema/field-descriptor';
import type { ColumnMove, SortEntry, TableColumn } from '../../data/table/types';
import type { ViewKey } from '../../data/view-state/snapshot';
import type {
  IdRefDefaultResolver, IdRefDisplayResolver, IdRefTargetFieldResolver,
} from './behavior/display-substitution';

interface DataTableProps<T> {
  rows: readonly T[];
  schema: readonly FieldDescriptor[];
  getRowId: (row: T) => string;
  /** Binds layout to the durable + session view tiers. Omitted, the table is ephemeral. */
  viewKey?: ViewKey;
  /** Initial column specs; defaults to every non-hidden top-level field in fit-to-content mode. */
  fallbackColumns?: readonly TableColumn[];
  /** Grouping when this view has nothing saved yet. Omitted, it opens flat. A saved layout always wins. */
  fallbackGroupBy?: readonly string[];
  onSelect?: (id: string) => void;
  selectedId?: string | null;
  /** Singular / plural noun for the footer's row count. Defaults to entry / entries. */
  countLabel?: readonly [one: string, many: string];
  emptyMessage?: string;
  /** Both optional: without them a reference column offers no display choice and every cell shows its id. */
  resolveTargetFields?: IdRefTargetFieldResolver;
  resolveIdRefDisplay?: IdRefDisplayResolver;
  /** Baseline name for a reference column with no `displayField`. Optional; without it the id shows. */
  resolveIdRefDefault?: IdRefDefaultResolver;
}

/** Actions about one column, bound onto the headless hook. Table-wide actions belong in `TableActions`. */
interface ColumnActions {
  /** Header click: replaces the whole sort, cycling asc, desc, none. */
  onToggleSort: (path: string) => void;
  /** Menu only: sorts this column in one named direction, adding a level when it has none (the route to multi-sort). */
  onSortDir: (path: string, dir: SortEntry['dir']) => void;
  /** Menu only: drops just this column's level. */
  onRemoveSort: (path: string) => void;
  /** Menu only. `at` is the index the new column ends up at: `N` for "before", `N + 1` for "after". */
  onAddColumnAt: (path: string, at: number) => void;
  onRemove: (path: string) => void;
  onMove: (path: string, move: ColumnMove) => void;
  /** Visual rename: sets the column's label, never the field's. */
  onRename: (path: string, label: string) => void;
  /** Reference columns only: which field of the target record to show in place of the id. `undefined` puts the id back. Cosmetic. */
  onSetDisplayField: (path: string, displayField: string | undefined) => void;
  onGroupBy: (path: string) => void;
  onUngroup: (path: string) => void;
  /** A pixel width, from the end of a seam drag or from a measurement. */
  onResize: (path: string, width: number) => void;
  /** A width to show without committing it, during a seam drag. Writes the track list straight onto the DOM. */
  onPreviewResize: (path: string, width: number) => void;
  /** Turns on persistent fit-to-content, which keeps re-measuring as content changes. */
  onFitToContent: (path: string) => void;
  /** Give the column whatever width the other columns leave over. */
  onExpandToFill: (path: string) => void;
}

/** The actions that are about the whole table, so they appear exactly once. */
interface TableActions {
  /** Appends a column at the end. The only entry point left when every column has been removed. */
  onAddColumn: (path: string) => void;
  onClearSort: () => void;
  onClearGroupBy: () => void;
  /** Turns on persistent fit-to-content for every visible column, at once. */
  onFitAllToContent: () => void;
  onResetColumns: () => void;
}

/** What the header cell knows when a drag begins. `ghost` is owned by the cell and borrowed for `setDragImage`. */
interface ColumnDragStart {
  path: string;
  index: number;
  event: DragEvent<HTMLElement>;
  /** Offscreen column strip to use as the drag image; null falls back to the browser's. */
  ghost: HTMLElement | null;
}

/** Native HTML5 drag reorder; no dnd dependency. */
interface ColumnDragBinding {
  draggingPath: string | null;
  /** Where the carried column started, which says which way it is going. */
  draggingIndex: number | null;
  overIndex: number | null;
  onDragStart: (start: ColumnDragStart) => void;
  onDragOver: (index: number, event: DragEvent<HTMLElement>) => void;
  onDrop: (index: number, event: DragEvent<HTMLElement>) => void;
  onDragEnd: () => void;
  /** The bare grid behind the cells, on dragenter and dragover. Keeps the gap the columns open droppable; a release there would otherwise be cancelled. */
  onSurfaceHover: (event: DragEvent<HTMLElement>) => void;
  /** The same ground, released on: it lands where the preview already said. */
  onSurfaceDrop: (event: DragEvent<HTMLElement>) => void;
}

/** The seam drag, pointer-driven. `resizing` lets the header cell drop `draggable` while a seam is pulled, so the two gestures never fire together. */
interface ColumnResizeBinding {
  resizing: boolean;
  onPointerDown: (event: PointerEvent<HTMLElement>) => void;
  onPointerMove: (event: PointerEvent<HTMLElement>) => void;
  onPointerUp: (event: PointerEvent<HTMLElement>) => void;
}

/** One parameter object instead of a dozen props drilled through the row tree. */
interface RowRenderContext<T> {
  columns: readonly TableColumn[];
  schema: SchemaIndex;
  /** The column in the air. Only the path travels here; the hovered index would re-render every row per mouse move. */
  draggingPath?: string | null;
  getRowId: (row: T) => string;
  selectedId?: string | null;
  onSelect?: (id: string) => void;
  isExpanded: (uid: string) => boolean;
  onToggleGroup: (uid: string) => void;
  /** Resolves a referenced record's display field. Rows and group headers share it, so they never disagree. */
  resolveIdRefDisplay?: IdRefDisplayResolver;
  /** The same baseline default as `DataTableProps`, threaded down for cells with no `displayField`. */
  resolveIdRefDefault?: IdRefDefaultResolver;
  /** Body cells are drop targets like the header. Only these two travel down: they are stable for the length of a drag. */
  onCellDragOver?: (index: number, event: DragEvent<HTMLElement>) => void;
  onCellDrop?: (index: number, event: DragEvent<HTMLElement>) => void;
}

export type {
  ColumnActions, ColumnDragBinding, ColumnDragStart, ColumnResizeBinding,
  DataTableProps, RowRenderContext, TableActions,
};
