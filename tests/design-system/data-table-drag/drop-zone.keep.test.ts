/* @layer tests @kind test */
import { describe, it, expect, vi } from 'vitest';
import { createElement, isValidElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { buildSchema, createSchemaIndex } from '@drizztdourden08/tessera/data';
import { ColumnDropTrash, ColumnResizeHandle, DataCell, DataRow } from '@drizztdourden08/tessera/composites';
import type { DragEvent, ReactElement } from 'react';
import type { ColumnResizeHandleProps, DataCellProps, ColumnResizeBinding, RowRenderContext } from '@drizztdourden08/tessera/composites';
import type { TableColumn } from '@drizztdourden08/tessera/data';
import { ALWAYS } from './data-table-drag.constants';

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
  const row = DataRow({ row: ROW, context }) as ReactElement<{ children: unknown[] }>;
  return row.props.children.flat().filter(
    (child): child is ReactElement<DataCellProps> => isValidElement(child) && child.type === DataCell,
  );
};

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

  it('renders the drop target once a column is in the air', () => {
    const markup = renderToStaticMarkup(createElement(ColumnDropTrash, {
      draggingPath: 'kind', label: 'Kind', onRemove: () => {}, onDragEnd: () => {},
    }));
    expect(markup).toContain('data-table__trash');
    expect(markup).toContain('aria-label="Drop Kind here to remove the column"');
    expect(markup).toContain('Drop to remove');
  });
});
