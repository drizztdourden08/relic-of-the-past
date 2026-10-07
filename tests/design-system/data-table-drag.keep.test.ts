/* @layer tests @kind test */
import { describe, it, expect, vi } from 'vitest';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { buildSchema, createSchemaIndex } from '../../apps/web/src/ui/design-system/data/schema/build-schema';
import {
  columnDragShift, dropEdgeAt,
} from '../../apps/web/src/ui/design-system/composites/DataTable/behavior/column-drag-shift';
import {
  ghostRowSample,
} from '../../apps/web/src/ui/design-system/composites/DataTable/behavior/ghost-row-sample';
import { groupUid } from '../../apps/web/src/ui/design-system/composites/DataTable/behavior/group-uid';
import {
  ColumnDragGhost,
} from '../../apps/web/src/ui/design-system/composites/DataTable/sub-components/ColumnDragGhost';
import {
  ColumnDropTrash,
} from '../../apps/web/src/ui/design-system/composites/DataTable/sub-components/ColumnDropTrash';
import {
  ColumnResizeHandle,
} from '../../apps/web/src/ui/design-system/composites/DataTable/sub-components/ColumnResizeHandle';
import {
  DataCell,
} from '../../apps/web/src/ui/design-system/composites/DataTable/sub-components/DataCell';
import {
  DataRow,
} from '../../apps/web/src/ui/design-system/composites/DataTable/sub-components/DataRow';
import { reorderColumn } from '../../apps/web/src/ui/design-system/data/table/column-ops';
import type { DragEvent, ReactElement } from 'react';
import type {
  ColumnResizeHandleProps,
} from '../../apps/web/src/ui/design-system/composites/DataTable/sub-components/ColumnResizeHandle';
import type {
  DataCellProps,
} from '../../apps/web/src/ui/design-system/composites/DataTable/sub-components/DataCell';
import type {
  ColumnResizeBinding, RowRenderContext,
} from '../../apps/web/src/ui/design-system/composites/DataTable/DataTable.type';
import type { GroupedRow, TableColumn } from '../../apps/web/src/ui/design-system/data/table/types';

// The gesture needs a browser. Pinned here: which cells step aside while a
// column is carried over them, and which way, checked against the reorder
// being previewed.

const COLUMNS: readonly TableColumn[] = ['a', 'b', 'c', 'd', 'e'].map((path) => ({ path }));

const shiftsFor = (from: number, over: number): string[] =>
  COLUMNS.map((_, index) => columnDragShift({ index, from, over }));

describe('column drag and which cells step aside', () => {
  it('moves nothing while the cursor is still over the column being carried', () => {
    expect(shiftsFor(2, 2)).toEqual(['none', 'none', 'none', 'none', 'none']);
  });

  it('moves nothing when there is no drag at all', () => {
    expect(columnDragShift({ index: 0, from: null, over: 3 })).toBe('none');
    expect(columnDragShift({ index: 0, from: 3, over: null })).toBe('none');
  });

  it('slides the columns it passes to the LEFT when carried rightwards', () => {
    expect(shiftsFor(1, 3)).toEqual(['none', 'none', 'left', 'left', 'none']);
  });

  it('slides the columns it passes to the RIGHT when carried leftwards', () => {
    expect(shiftsFor(3, 1)).toEqual(['none', 'right', 'right', 'none', 'none']);
  });

  it('never displaces the carried column itself because it is the hole, not a neighbour', () => {
    expect(columnDragShift({ index: 1, from: 1, over: 4 })).toBe('none');
    expect(columnDragShift({ index: 4, from: 4, over: 0 })).toBe('none');
  });

  it('opens the gap on the far side of the hovered cell, whichever way it came from', () => {
    expect(dropEdgeAt({ index: 3, from: 1, over: 3 })).toBe('after');
    expect(dropEdgeAt({ index: 1, from: 3, over: 1 })).toBe('before');
  });

  it('marks the landing edge on the hovered cell and on no other', () => {
    expect(COLUMNS.map((_, index) => dropEdgeAt({ index, from: 0, over: 3 })))
      .toEqual([null, null, null, 'after', null]);
  });

  it('marks no edge at rest', () => {
    expect(dropEdgeAt({ index: 2, from: 2, over: 2 })).toBeNull();
    expect(dropEdgeAt({ index: 2, from: null, over: 2 })).toBeNull();
  });
});

describe('the preview tells the truth about the reorder it previews', () => {
  const indexOf = (columns: readonly TableColumn[], path: string): number =>
    columns.findIndex((column) => column.path === path);

  const eachPair = (visit: (from: number, over: number) => void): void => {
    COLUMNS.forEach((_, from) => COLUMNS.forEach((__, over) => {
      if (from !== over) visit(from, over);
    }));
  };

  it('displaces exactly the columns the drop actually moves, by exactly one slot each', () => {
    eachPair((from, over) => {
      const next = reorderColumn(COLUMNS, COLUMNS[from].path, over);
      COLUMNS.forEach((column, index) => {
        const shift = columnDragShift({ index, from, over });
        const moved = indexOf(next, column.path) - index;
        if (index === from) return;
        expect({ from, over, index, shift, moved })
          .toEqual({ from, over, index, shift: moved === 0 ? 'none' : (moved < 0 ? 'left' : 'right'), moved });
        expect(Math.abs(moved)).toBeLessThanOrEqual(1);
      });
    });
  });

  it('puts the carried column on the side of the hovered one that the edge marked', () => {
    eachPair((from, over) => {
      const next = reorderColumn(COLUMNS, COLUMNS[from].path, over);
      const carried = indexOf(next, COLUMNS[from].path);
      const hovered = indexOf(next, COLUMNS[over].path);
      expect(dropEdgeAt({ index: over, from, over }))
        .toBe(carried > hovered ? 'after' : 'before');
    });
  });
});

// The cursor carries a strip of the column: its name over a few real values.
// Which values is a pure choice, pinned here; how Chromium draws it is not testable.

interface Sample { id: string }

const leaf = (id: string): GroupedRow<Sample> => ({ kind: 'row', row: { id } });

const branch = (key: string, children: readonly GroupedRow<Sample>[]): GroupedRow<Sample> =>
  ({ kind: 'group', level: 0, key, path: 'kind', count: children.length, children });

const ALWAYS = (): boolean => true;

const idsOf = (rows: readonly Sample[]): string[] => rows.map((row) => row.id);

describe('what the drag ghost samples out of the column', () => {
  const flat: readonly GroupedRow<Sample>[] = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'].map(leaf);

  it('takes the rows off the top, in the order they render', () => {
    expect(idsOf(ghostRowSample({ nodes: flat, isExpanded: ALWAYS, limit: 3 })))
      .toEqual(['a', 'b', 'c']);
  });

  it('caps at the limit however long the table is', () => {
    const long = Array.from({ length: 896 }, (_, index) => leaf(String(index)));
    expect(ghostRowSample({ nodes: long, isExpanded: ALWAYS, limit: 6 })).toHaveLength(6);
  });

  it('takes what there is when the table is shorter than the cap', () => {
    expect(idsOf(ghostRowSample({ nodes: flat.slice(0, 2), isExpanded: ALWAYS, limit: 6 })))
      .toEqual(['a', 'b']);
  });

  it('samples nothing at all instead of one row when the cap is zero', () => {
    expect(ghostRowSample({ nodes: flat, isExpanded: ALWAYS, limit: 0 })).toEqual([]);
  });

  it('walks into groups, so a grouped table samples records and not headings', () => {
    const grouped = [branch('one', [leaf('a'), leaf('b')]), branch('two', [leaf('c')])];
    expect(idsOf(ghostRowSample({ nodes: grouped, isExpanded: ALWAYS, limit: 6 })))
      .toEqual(['a', 'b', 'c']);
  });

  it('skips a collapsed branch because a row nobody can see is not a sample of the screen', () => {
    const grouped = [branch('one', [leaf('a'), leaf('b')]), branch('two', [leaf('c')])];
    const openOnly = (uid: string): boolean => uid === groupUid('', 'kind', 'two');
    expect(idsOf(ghostRowSample({ nodes: grouped, isExpanded: openOnly, limit: 6 })))
      .toEqual(['c']);
  });
});

describe('the drag ghost shows the column, not just its name', () => {
  const rows = [{ label: 'first' }, { label: 'second' }];

  const renderGhost = (extra: Record<string, unknown> = {}): string =>
    renderToStaticMarkup(createElement(ColumnDragGhost, {
      label: 'Label', path: 'label', rows, total: rows.length, ...extra,
    }));

  it('carries the header name and a cell for every row it sampled', () => {
    const markup = renderGhost();
    expect(markup).toContain('Label');
    expect(markup).toContain('first');
    expect(markup).toContain('second');
    expect(markup.match(/data-table__drag-ghost-cell/g)).toHaveLength(2);
  });

  it('owns up to the rows it left behind, and stays quiet when there are none', () => {
    expect(renderGhost({ total: 896 })).toContain('+894 more');
    expect(renderGhost()).not.toContain('data-table__drag-ghost-rest');
  });

  it('is decorative, so nothing in it is announced or reachable', () => {
    expect(renderGhost()).toContain('aria-hidden="true"');
  });
});

// The drop zone is the whole column, header AND body: each body cell carries
// its own position, so the drop works from anywhere down the column.

interface Record3 { id: string; name: string; size: number }

const ROW: Record3 = { id: 'item-1', name: 'first', size: 3 };
const ROW_COLUMNS: readonly TableColumn[] = [{ path: 'id' }, { path: 'name' }, { path: 'size' }];
const DRAG_EVENT = { type: 'dragover' } as unknown as DragEvent<HTMLElement>;

const rowContext = (over?: RowRenderContext<Record3>['onCellDragOver'], drop?: RowRenderContext<Record3>['onCellDrop']): RowRenderContext<Record3> => ({
  columns: ROW_COLUMNS,
  schema: createSchemaIndex(buildSchema([ROW])),
  getRowId: (row: Record3) => row.id,
  isExpanded: ALWAYS,
  onToggleGroup: () => {},
  onCellDragOver: over,
  onCellDrop: drop,
});

const cellsOf = (context: RowRenderContext<Record3>): ReactElement<DataCellProps>[] => {
  const row = DataRow({ row: ROW, context }) as ReactElement<{ children: ReactElement<DataCellProps>[] }>;
  return row.props.children;
};

/** What the cell hands the browser, once it has been given its own props. */
const boxPropsOf = (cell: ReactElement<DataCellProps>): Record<string, unknown> => {
  const box = DataCell(cell.props) as ReactElement<Record<string, unknown>>;
  return box.props;
};

describe('a column is droppable down its whole body, not only on its header', () => {
  it('gives every body cell the index its own header answers with', () => {
    const cells = cellsOf(rowContext(() => {}, () => {}));
    expect(cells.map((cell) => cell.props.index)).toEqual([0, 1, 2]);
    expect(cells.map((cell) => cell.props.path)).toEqual(['id', 'name', 'size']);
  });

  it('reports a dragover anywhere in the body as a hover over THAT column', () => {
    const onCellDragOver = vi.fn();
    const cells = cellsOf(rowContext(onCellDragOver, () => {}));
    (boxPropsOf(cells[2]).onDragOver as (event: DragEvent<HTMLElement>) => void)(DRAG_EVENT);
    expect(onCellDragOver).toHaveBeenCalledWith(2, DRAG_EVENT);
  });

  it('drops into that same column, so the body performs the reorder the header would', () => {
    const onCellDrop = vi.fn();
    const cells = cellsOf(rowContext(() => {}, onCellDrop));
    (boxPropsOf(cells[0]).onDrop as (event: DragEvent<HTMLElement>) => void)(DRAG_EVENT);
    expect(onCellDrop).toHaveBeenCalledWith(0, DRAG_EVENT);
  });

  it('leaves the handlers off entirely when no drag is wired up', () => {
    const cells = cellsOf(rowContext());
    expect(boxPropsOf(cells[1]).onDragOver).toBeUndefined();
    expect(boxPropsOf(cells[1]).onDrop).toBeUndefined();
  });

  it('marks the carried column\'s own cells, and only those', () => {
    const context = { ...rowContext(() => {}, () => {}), draggingPath: 'name' };
    expect(cellsOf(context).map((cell) => cell.props.dragging)).toEqual([false, true, false]);
  });
});

// The seam sits over the gutter between columns, which a carried column
// crosses. A hole there and the header never hears the cursor moved on, so the
// seam answers the drag with its own column's index.

const IDLE_RESIZE: ColumnResizeBinding = {
  resizing: false,
  onPointerDown: () => {},
  onPointerMove: () => {},
  onPointerUp: () => {},
};

const seamProps = (extra: Partial<ColumnResizeHandleProps> = {}): Record<string, unknown> => {
  const strip = ColumnResizeHandle({
    label: 'Kind', index: 2, resize: IDLE_RESIZE, ...extra,
  }) as ReactElement<Record<string, unknown>>;
  return strip.props;
};

const fire = (handler: unknown): void =>
  (handler as (event: DragEvent<HTMLElement>) => void)(DRAG_EVENT);

describe('the seam between two headers is part of the drop zone', () => {
  it('reports a dragover over the gutter as a hover over its own column', () => {
    const onDragOver = vi.fn();
    fire(seamProps({ onDragOver }).onDragOver);
    expect(onDragOver).toHaveBeenCalledWith(2, DRAG_EVENT);
  });

  it('drops into that same column, so the gutter lands where the cell would', () => {
    const onDrop = vi.fn();
    fire(seamProps({ index: 0, onDrop }).onDrop);
    expect(onDrop).toHaveBeenCalledWith(0, DRAG_EVENT);
  });

  it('leaves the handlers off entirely when no drag is wired up', () => {
    expect(seamProps().onDragOver).toBeUndefined();
    expect(seamProps().onDrop).toBeUndefined();
  });

  it('is still not draggable itself, and still owns the resize gesture', () => {
    const props = seamProps({ onDragOver: () => {}, onDrop: () => {} });
    expect(props.draggable).toBe(false);
    expect(props.onPointerDown).toBe(IDLE_RESIZE.onPointerDown);
    expect(props.onPointerMove).toBe(IDLE_RESIZE.onPointerMove);
    expect(props.onPointerUp).toBe(IDLE_RESIZE.onPointerUp);
  });
});

describe('the remove target only exists mid-drag', () => {
  it('renders nothing at all while no column is being carried', () => {
    const markup = renderToStaticMarkup(createElement(ColumnDropTrash, {
      draggingPath: null, label: '', onRemove: () => {}, onDragEnd: () => {},
    }));
    expect(markup).toBe('');
  });

  // Used to escape through the shared overlay portal, which needs a document.
  // Absolutely positioned in the table's own tree, plain SSR can see it.
  it('renders the drop target once a column is in the air', () => {
    const markup = renderToStaticMarkup(createElement(ColumnDropTrash, {
      draggingPath: 'kind', label: 'Kind', onRemove: () => {}, onDragEnd: () => {},
    }));
    expect(markup).toContain('data-table__trash');
    expect(markup).toContain('aria-label="Drop Kind here to remove the column"');
    expect(markup).toContain('Drop to remove');
  });
});
