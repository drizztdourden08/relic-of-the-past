/* @layer tests @kind test */
import { describe, it, expect } from 'vitest';
import {
  columnDragShift, dropEdgeAt,
} from '../../../apps/web/src/ui/design-system/composites/DataTable/behavior/column-drag-shift';
import { reorderColumn } from '../../../apps/web/src/ui/design-system/data/table/column-ops';
import type { TableColumn } from '../../../apps/web/src/ui/design-system/data/table/types';

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
