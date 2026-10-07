/* @layer tests @kind test */
import { describe, it, expect, vi } from 'vitest';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import {
  columnDragShift, dropEdgeAt,
} from '../../apps/web/src/ui/design-system/composites/DataTable/behavior/column-drag-shift';
import {
  useColumnDrag,
} from '../../apps/web/src/ui/design-system/composites/DataTable/behavior/use-column-drag';
import { reorderColumn } from '../../apps/web/src/ui/design-system/data/table/column-ops';
import type { DragEvent } from 'react';
import type {
  ColumnDragBinding,
} from '../../apps/web/src/ui/design-system/composites/DataTable/DataTable.type';
import type { TableColumn } from '../../apps/web/src/ui/design-system/data/table/types';

// The failure this file exists for: the FIRST drop landed and every drop after
// was refused. So every case runs a gesture, checks it landed, then runs
// ANOTHER against the list the first produced.
//
// The refusal was geometric: columns step aside to open a gap, and a cursor
// held still ends up on bare grid no cell owns, which the browser cancels
// (`dragend` fires, `drop` never does). That needs a real browser. Pinned here:
// the surface behind the cells says yes to the drag, and a cell's own drop is
// not answered twice.

const PATHS = ['a', 'b', 'c', 'd', 'e'] as const;
const COLUMNS: readonly TableColumn[] = PATHS.map((path) => ({ path }));

const pathsOf = (columns: readonly TableColumn[]): string[] =>
  columns.map((column) => column.path);

const indexOf = (columns: readonly TableColumn[], path: string): number =>
  columns.findIndex((column) => column.path === path);

describe('two reorders in a row, each read off what the last one left', () => {
  it('commits the second drag as fully as the first', () => {
    const once = reorderColumn(COLUMNS, 'a', 3);
    expect(pathsOf(once)).toEqual(['b', 'c', 'd', 'a', 'e']);
    const twice = reorderColumn(once, 'e', 0);
    expect(pathsOf(twice)).toEqual(['e', 'b', 'c', 'd', 'a']);
  });

  it('moves the SAME column twice, which is the gesture a user repeats', () => {
    const once = reorderColumn(COLUMNS, 'a', 4);
    const twice = reorderColumn(once, 'a', 1);
    expect(pathsOf(once)).toEqual(['b', 'c', 'd', 'e', 'a']);
    expect(pathsOf(twice)).toEqual(['b', 'a', 'c', 'd', 'e']);
  });

  it('is not the identity: two drags do not silently undo each other', () => {
    const twice = reorderColumn(reorderColumn(COLUMNS, 'b', 4), 'd', 0);
    expect(pathsOf(twice)).not.toEqual(pathsOf(COLUMNS));
    expect(pathsOf(twice)).toEqual(['d', 'a', 'c', 'e', 'b']);
  });

  it('reads the second drag off the NEW positions because the old index is a different column now', () => {
    const once = reorderColumn(COLUMNS, 'a', 3);
    /* 'a' sat at 0 and now sits at 3; a second gesture that still thought it
       was at 0 would pick up 'b' instead and land somewhere else entirely. */
    expect(indexOf(once, 'a')).toBe(3);
    expect(pathsOf(reorderColumn(once, once[0].path, 4))).toEqual(['c', 'd', 'a', 'e', 'b']);
  });
});

describe('the preview still tells the truth on the second gesture', () => {
  const settled = reorderColumn(COLUMNS, 'a', 3);

  const eachPair = (visit: (from: number, over: number) => void): void => {
    settled.forEach((_, from) => settled.forEach((__, over) => {
      if (from !== over) visit(from, over);
    }));
  };

  it('displaces exactly what the second drop moves, over the reordered list', () => {
    eachPair((from, over) => {
      const next = reorderColumn(settled, settled[from].path, over);
      settled.forEach((column, index) => {
        if (index === from) return;
        const moved = indexOf(next, column.path) - index;
        expect({ from, over, index, shift: columnDragShift({ index, from, over }) })
          .toEqual({ from, over, index, shift: moved === 0 ? 'none' : (moved < 0 ? 'left' : 'right') });
      });
    });
  });

  it('marks the landing edge on the side the second drop lands on', () => {
    eachPair((from, over) => {
      const next = reorderColumn(settled, settled[from].path, over);
      const carried = indexOf(next, settled[from].path);
      const hovered = indexOf(next, settled[over].path);
      expect(dropEdgeAt({ index: over, from, over })).toBe(carried > hovered ? 'after' : 'before');
    });
  });
});

// The hook, driven straight. No DOM, so it never commits state, which is the
// condition the drop handler must survive: with no remembered path it falls
// back to the one the drag carries.

interface FakeEvent {
  event: DragEvent<HTMLElement>;
  prevented: () => number;
  stopped: () => number;
  dropEffect: () => string;
}

const fakeEvent = (path: string): FakeEvent => {
  const preventDefault = vi.fn();
  const stopPropagation = vi.fn();
  const dataTransfer = { dropEffect: '', getData: () => path };
  const event = { preventDefault, stopPropagation, dataTransfer } as unknown as DragEvent<HTMLElement>;
  return {
    event,
    prevented: () => preventDefault.mock.calls.length,
    stopped: () => stopPropagation.mock.calls.length,
    dropEffect: () => dataTransfer.dropEffect,
  };
};

const renderDrag = (onReorder: (path: string, to: number) => void): ColumnDragBinding => {
  let captured: ColumnDragBinding | undefined;
  const Harness = (): null => {
    captured = useColumnDrag(onReorder);
    return null;
  };
  renderToStaticMarkup(createElement(Harness));
  if (!captured) throw new Error('useColumnDrag did not run');
  return captured;
};

describe('the drop binding lands one gesture after another', () => {
  it('reorders on the first drop and on the second, against the list each left', () => {
    let columns = COLUMNS;
    const commit = (path: string, to: number): void => { columns = reorderColumn(columns, path, to); };

    const first = fakeEvent('a');
    renderDrag(commit).onDrop(3, first.event);
    expect(pathsOf(columns)).toEqual(['b', 'c', 'd', 'a', 'e']);

    const second = fakeEvent('e');
    renderDrag(commit).onDrop(0, second.event);
    expect(pathsOf(columns)).toEqual(['e', 'b', 'c', 'd', 'a']);
  });

  it('answers a cell drop once and once only, so the surface behind it must not answer too', () => {
    const drop = fakeEvent('a');
    renderDrag(() => {}).onDrop(2, drop.event);
    expect(drop.stopped()).toBe(1);
    expect(drop.prevented()).toBe(1);
  });
});

describe('the ground between the columns accepts the drag', () => {
  it('says yes on hover, which is the whole reason a release there is honoured', () => {
    const hover = fakeEvent('a');
    renderDrag(() => {}).onSurfaceHover(hover.event);
    expect(hover.prevented()).toBe(1);
    expect(hover.dropEffect()).toBe('move');
  });

  it('claims no column of its own, so the hovered slot stays whatever the cells said', () => {
    const binding = renderDrag(() => {});
    const hover = fakeEvent('a');
    binding.onSurfaceHover(hover.event);
    expect(binding.overIndex).toBeNull();
    expect(hover.stopped()).toBe(0);
  });

  it('reorders nothing when released with no column hovered at all', () => {
    const onReorder = vi.fn();
    const drop = fakeEvent('a');
    renderDrag(onReorder).onSurfaceDrop(drop.event);
    expect(onReorder).not.toHaveBeenCalled();
    expect(drop.prevented()).toBe(1);
  });
});
