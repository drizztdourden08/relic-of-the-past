// @vitest-environment jsdom
/* @layer tests @kind test */
/**
 * §50's `CellPicker` is the child's own control, and the ONLY place in the panel
 * where clicking a cell writes anything.
 *
 * THE TWO CONTROLS LOOK ALIKE AND MEAN OPPOSITE THINGS, which is exactly the
 * confusion the maintainer warned about, so the pair of properties asserted here
 * is the pair that keeps them apart: this one writes a child and cannot touch a
 * track; `GridEditor` writes tracks and cannot touch a child
 * (`hud-grid-editor.keep.test.ts`). Each one says which it is in its own header,
 * and that is asserted too, because it is the only thing a reader has to go on.
 */
import { afterEach, describe, expect, it, vi } from 'vitest';
import { act, createElement as h, type ReactNode } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { CellPicker } from '../../apps/web/src/ui/domains/app/views/HudLayoutEditor/sub-components/CellPicker';
import { PlatformContext } from '../../apps/web/src/platform/PlatformProvider';
import type { Platform } from '../../shared/platform';
import type { HudGridContainer, HudNode } from '../../shared/types/hud';

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
const ignore = (): void => {};
class NoopResizeObserver { observe = ignore; unobserve = ignore; disconnect = ignore; }
(globalThis as { ResizeObserver?: unknown }).ResizeObserver = NoopResizeObserver;

const PLATFORM = { info: { os: 'windows' } } as unknown as Platform;

const leaf = (id: string, place?: Record<string, number>): HudNode =>
  ({ id, kind: 'element', element: { type: 'spacer' }, ...(place ? { place } : {}) }) as unknown as HudNode;

const PARENT: HudGridContainer = {
  kind: 'container', id: 'screen', layout: 'grid',
  columns: ['auto', 'fill', 'auto'], rows: ['auto', 'fill', 'auto'],
  children: [leaf('vitals', { column: 1, row: 1 }), leaf('wallet', { column: 1, row: 3 })],
};

let mounted: { root: Root; host: HTMLElement } | null = null;

const mount = (node: ReactNode): void => {
  const host = document.createElement('div');
  document.body.appendChild(host);
  const root = createRoot(host);
  act(() => { root.render(h(PlatformContext.Provider, { value: PLATFORM }, node)); });
  mounted = { root, host };
};

afterEach(() => {
  if (!mounted) return;
  act(() => mounted?.root.unmount());
  mounted.host.remove();
  mounted = null;
});

const cell = (column: number, row: number): HTMLElement => {
  const found = document.querySelector<HTMLElement>(`.hud-lattice__cell[data-column="${column}"][data-row="${row}"]`);
  if (!found) throw new Error(`no cell ${column},${row}`);
  return found;
};

const down = (el: Element, init: MouseEventInit = {}): void => {
  act(() => { el.dispatchEvent(new MouseEvent('pointerdown', { bubbles: true, cancelable: true, ...init })); });
};
const over = (el: Element): void => {
  act(() => { el.dispatchEvent(new MouseEvent('pointerover', { bubbles: true, cancelable: true })); });
};
const up = (el: Element): void => {
  act(() => { el.dispatchEvent(new MouseEvent('pointerup', { bubbles: true, cancelable: true })); });
};

const picker = (onChange: (place: unknown) => void, place: Record<string, number> = { column: 1, row: 3 }): void => {
  mount(h(CellPicker, { container: PARENT, childId: 'wallet', place, onChange }));
};

describe('a click sets the cell, and only the cell', () => {
  it('writes `place` for the child it was opened for', () => {
    const onChange = vi.fn();
    picker(onChange);
    down(cell(3, 3));
    expect(onChange).toHaveBeenCalledWith({ column: 3, row: 3 });
  });

  it('CLEARS the spans on a plain placement, because moving is moving (§42.8)', () => {
    const onChange = vi.fn();
    mount(h(CellPicker, {
      container: PARENT, childId: 'wallet', place: { column: 1, row: 1, colSpan: 3, rowSpan: 2 }, onChange,
    }));
    down(cell(2, 2));
    expect(onChange).toHaveBeenCalledWith({ column: 2, row: 2 });
  });
});

describe('shift and drag set the span', () => {
  it('spans from the child\'s own origin to a shift-clicked cell', () => {
    const onChange = vi.fn();
    picker(onChange, { column: 1, row: 1 });
    down(cell(3, 2), { shiftKey: true });
    expect(onChange).toHaveBeenCalledWith({ column: 1, row: 1, colSpan: 3, rowSpan: 2 });
  });

  it('commits a dragged rectangle EXACTLY ONCE, on the release', () => {
    const onChange = vi.fn();
    picker(onChange, { column: 1, row: 1 });
    down(cell(1, 1));
    expect(onChange).toHaveBeenCalledTimes(1);
    over(cell(2, 2));
    over(cell(3, 3));
    // Nothing is written while the pointer travels.
    expect(onChange).toHaveBeenCalledTimes(1);
    up(cell(3, 3));
    expect(onChange).toHaveBeenCalledTimes(2);
    expect(onChange).toHaveBeenLastCalledWith({ column: 1, row: 1, colSpan: 3, rowSpan: 3 });
  });

  it('writes no span at all for a one-cell rectangle', () => {
    const onChange = vi.fn();
    picker(onChange, { column: 2, row: 2 });
    down(cell(2, 2), { shiftKey: true });
    expect(onChange).toHaveBeenCalledWith({ column: 2, row: 2 });
  });
});

describe('it shows the parent\'s grid and never changes it', () => {
  it('offers no toolbar and no selectable track header', () => {
    picker(ignore);
    expect(document.querySelector('.hud-grid__bar')).toBeNull();
    expect(document.querySelectorAll('[data-action]').length).toBe(0);
    for (const head of Array.from(document.querySelectorAll('.hud-lattice__head'))) {
      expect((head as HTMLElement).dataset.inert).toBe('true');
    }
  });

  it('presses a header and writes nothing', () => {
    const onChange = vi.fn();
    picker(onChange);
    const head = document.querySelector('.hud-lattice__head');
    if (head) down(head);
    expect(onChange).not.toHaveBeenCalled();
  });

  it('draws the siblings, and marks its OWN cells as the selection', () => {
    picker(ignore, { column: 1, row: 3 });
    expect(cell(1, 1).dataset.state).toBe('occupied');
    expect(cell(1, 3).dataset.state).toBe('selected');
    expect(cell(2, 2).dataset.state).toBe('empty');
  });
});

describe('each control says which document it edits', () => {
  it('names the child here and the container in the grid editor', () => {
    picker(ignore);
    expect(document.querySelector('.hud-cellpick__title')?.textContent)
      .toBe("The cell where wallet sits in its parent's grid");
    expect(document.body.textContent).toContain("The parent's columns and rows are edited in its own Layout section.");
  });
});
