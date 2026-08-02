/* @layer renderer-components @kind types */
/**
 * Table state is plain, serialisable data — that is what lets a snapshot of it
 * be written to disk and restored without the table knowing storage exists.
 */

interface TableColumn {
  path: string;
  /** A visual rename; the path stays the identity. */
  label?: string;
  /**
   * A fixed track width in pixels. Absent, the column takes the automatic
   * track. Mutually exclusive with `grow` and `fit` — a column cannot be a
   * measured width and also whatever is left over, or also a width that
   * keeps re-measuring itself.
   */
  width?: number;
  /** Take the leftover width of the row instead of a fixed or automatic track. */
  grow?: boolean;
  /**
   * Persistent "fit to content": the column keeps re-measuring the widest
   * value currently on screen and renders at that width, rather than
   * freezing at whatever it measured the moment this was turned on. Mutually
   * exclusive with `width` and `grow`, the same way those two are with each
   * other.
   */
  fit?: boolean;
  /**
   * For a reference column: which field of the RECORD IT POINTS AT to show in
   * the cell, instead of the raw id. A path in the TARGET collection's schema,
   * not in this one — the column's own `path` still says which id is read, and
   * the id itself still travels on the cell, so following the reference is
   * unaffected by whatever is on screen. Absent, the cell shows the id.
   */
  displayField?: string;
}

interface SortEntry {
  path: string;
  dir: 'asc' | 'desc';
}

interface TableState {
  columns: readonly TableColumn[];
  /** Multi-sort; a header click replaces the whole list, a menu appends. */
  sort: readonly SortEntry[];
  /** Layered grouping, outermost first. */
  groupBy: readonly string[];
}

type ColumnMove = 'left' | 'right' | 'first' | 'last';

/**
 * The renderable result of layered grouping. Group nodes NEST — a group's
 * `children` are either the next grouping level or the rows themselves — so a
 * renderer walks the tree recursively and collapsing a node is a local
 * decision. `count` is the total number of leaf rows beneath the node.
 */
type GroupedRow<T> =
  | {
      kind: 'group';
      /** 0 for the outermost grouping level. */
      level: number;
      /** The group-key value, already stringified. */
      key: string;
      /** Which groupBy path produced this level. */
      path: string;
      count: number;
      children: readonly GroupedRow<T>[];
    }
  | { kind: 'row'; row: T };

export type { ColumnMove, GroupedRow, SortEntry, TableColumn, TableState };
