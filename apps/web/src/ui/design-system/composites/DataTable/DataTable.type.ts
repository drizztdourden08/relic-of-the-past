/* @layer renderer-components @kind types */
/**
 * The table is a presentational shell over the headless core: it renders what
 * `useDataTable` produced and calls back into it. Nothing here describes state
 * the core already owns — a column list, a sort list and a groupBy list are
 * that hook's business, and these types only carry them across the boundary.
 */
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
  /**
   * Binds layout to the durable + session view tiers. Omitted, the table is
   * fully functional and purely ephemeral — no disk read, no store write.
   */
  viewKey?: ViewKey;
  /**
   * Initial column specs; defaults to every non-hidden top-level field, each
   * opening in the persistent fit-to-content mode.
   */
  fallbackColumns?: readonly TableColumn[];
  /**
   * Grouping the table opens with when this view has nothing saved yet.
   * Omitted, it opens flat. A saved layout always wins — a view the user has
   * arranged has already answered this question.
   */
  fallbackGroupBy?: readonly string[];
  onSelect?: (id: string) => void;
  selectedId?: string | null;
  /**
   * Singular / plural noun for the footer's row count. Defaults to
   * entry / entries, which is what a generic table is showing.
   */
  countLabel?: readonly [one: string, many: string];
  emptyMessage?: string;
  /**
   * The two halves of "show the name, not the id". Both optional: without them
   * a reference column offers no display choice and every cell reads as its id,
   * which is exactly how the table behaved before they existed.
   */
  resolveTargetFields?: IdRefTargetFieldResolver;
  resolveIdRefDisplay?: IdRefDisplayResolver;
  /**
   * The BASELINE name for a reference column with no `displayField` chosen —
   * every cell that would otherwise show a raw id gets a turn at this before
   * falling all the way back to it. Optional, same as the other two: without
   * it an unconfigured column shows the id, exactly as before this existed.
   */
  resolveIdRefDefault?: IdRefDefaultResolver;
}

/**
 * Everything a header cell or its ⋯ menu can ask for — all of it about ONE
 * column. Whatever applies to the table as a whole belongs in `TableActions`
 * and lives in the footer's menu, not repeated in every column's menu.
 *
 * Each one is a thin binding onto the headless hook, which is where the
 * transform actually happens.
 */
interface ColumnActions {
  /** Header click — REPLACES the whole sort, cycling asc → desc → none. */
  onToggleSort: (path: string) => void;
  /**
   * Menu only — sorts this column in ONE named direction, adding a level when
   * it has none. Naming the direction is what lets the menu offer ascending and
   * descending as two choices, and adding is the sole route to multi-sort.
   */
  onSortDir: (path: string, dir: SortEntry['dir']) => void;
  /** Menu only — drops just this column's level, leaving any others intact. */
  onRemoveSort: (path: string) => void;
  /**
   * Menu only — brings a field in at a chosen slot. `at` is the index the new
   * column ends up at, so a column at index N offers `N` for "before" and
   * `N + 1` for "after".
   */
  onAddColumnAt: (path: string, at: number) => void;
  onRemove: (path: string) => void;
  onMove: (path: string, move: ColumnMove) => void;
  /** Visual rename: sets the column's label, never the field's. */
  onRename: (path: string, label: string) => void;
  /**
   * Reference columns only: which field of the RECORD IT POINTS AT to show in
   * place of the id. `undefined` puts the id back. Cosmetic — the id itself is
   * untouched, so following the reference goes to the same record either way.
   */
  onSetDisplayField: (path: string, displayField: string | undefined) => void;
  onGroupBy: (path: string) => void;
  onUngroup: (path: string) => void;
  /** A pixel width, from the end of a seam drag or from a measurement. */
  onResize: (path: string, width: number) => void;
  /**
   * A width to SHOW without committing it, for the length of a seam drag. It
   * writes the grid's track list straight onto the DOM: state per mouse move
   * would re-render every row in the table, over and over, mid-gesture.
   */
  onPreviewResize: (path: string, width: number) => void;
  /** Turns on persistent fit-to-content — keeps re-measuring as content changes. */
  onFitToContent: (path: string) => void;
  /** Give the column whatever width the other columns leave over. */
  onExpandToFill: (path: string) => void;
}

/** The actions that are about the whole table, so they appear exactly once. */
interface TableActions {
  /**
   * Appends a column at the end. Placing one goes through a column's own menu;
   * this is the entry point for "anywhere will do" — and the only one left when
   * every column has been removed.
   */
  onAddColumn: (path: string) => void;
  onClearSort: () => void;
  onClearGroupBy: () => void;
  /** Turns on persistent fit-to-content for every visible column, at once. */
  onFitAllToContent: () => void;
  onResetColumns: () => void;
}

/**
 * Everything the header cell knows at the instant a drag begins. It travels as
 * one object because `ghost` is the odd one out: an element the cell owns and
 * the hook only borrows, for the single `setDragImage` call.
 */
interface ColumnDragStart {
  path: string;
  index: number;
  event: DragEvent<HTMLElement>;
  /** Offscreen column strip to use as the drag image; null falls back to the browser's. */
  ghost: HTMLElement | null;
}

/** Native HTML5 drag reorder — no dnd dependency anywhere in this package. */
interface ColumnDragBinding {
  draggingPath: string | null;
  /** Where the carried column started, which is what says WHICH WAY it is going. */
  draggingIndex: number | null;
  overIndex: number | null;
  onDragStart: (start: ColumnDragStart) => void;
  onDragOver: (index: number, event: DragEvent<HTMLElement>) => void;
  onDrop: (index: number, event: DragEvent<HTMLElement>) => void;
  onDragEnd: () => void;
  /**
   * The table surface behind the cells, on both dragenter and dragover. The
   * columns step aside mid-drag and the gap they open is bare grid, so a cursor
   * held still long enough to see them finish is standing on ground no cell
   * owns — and a release there is a release the browser cancels. This keeps
   * that ground droppable without claiming a column of its own.
   */
  onSurfaceHover: (event: DragEvent<HTMLElement>) => void;
  /** The same ground, released on: it lands where the preview already said. */
  onSurfaceDrop: (event: DragEvent<HTMLElement>) => void;
}

/**
 * The seam drag, which is pointer-driven rather than an HTML5 drag: it carries
 * nothing and ends at a position, not at a target. `resizing` is what lets the
 * header cell drop its `draggable` flag while a seam is being pulled, so the
 * two gestures never fire together.
 */
interface ColumnResizeBinding {
  resizing: boolean;
  onPointerDown: (event: PointerEvent<HTMLElement>) => void;
  onPointerMove: (event: PointerEvent<HTMLElement>) => void;
  onPointerUp: (event: PointerEvent<HTMLElement>) => void;
}

/** One parameter object rather than a dozen props drilled through the row tree. */
interface RowRenderContext<T> {
  columns: readonly TableColumn[];
  schema: SchemaIndex;
  /**
   * The column currently in the air, so its body cells empty out with its
   * header. Only the path travels here — the hovered index changes on every
   * mouse move and would re-render every row for a header-only effect.
   */
  draggingPath?: string | null;
  getRowId: (row: T) => string;
  selectedId?: string | null;
  onSelect?: (id: string) => void;
  isExpanded: (uid: string) => boolean;
  onToggleGroup: (uid: string) => void;
  /**
   * Answers what a referenced record holds, for a column that asked to show
   * one of its fields instead of the id. Rows and group headers read it through
   * the same call, so a grouped reference never disagrees with its own cells.
   */
  resolveIdRefDisplay?: IdRefDisplayResolver;
  /** The same baseline default as `DataTableProps`, threaded down for cells with no `displayField`. */
  resolveIdRefDefault?: IdRefDefaultResolver;
  /**
   * A column's body cells are a drop target for the column drag, exactly like
   * its header — which is what makes the whole column, top to bottom, the place
   * a carried column can be dropped.
   *
   * Only these two travel down here, never the whole drag binding: they are
   * stable for the length of a drag, whereas the hovered index changes on every
   * mouse move and would re-render every row in the table for a header effect.
   */
  onCellDragOver?: (index: number, event: DragEvent<HTMLElement>) => void;
  onCellDrop?: (index: number, event: DragEvent<HTMLElement>) => void;
}

export type {
  ColumnActions, ColumnDragBinding, ColumnDragStart, ColumnResizeBinding,
  DataTableProps, RowRenderContext, TableActions,
};
