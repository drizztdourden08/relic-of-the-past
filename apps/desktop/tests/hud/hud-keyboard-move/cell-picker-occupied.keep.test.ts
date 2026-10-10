/* @layer tests @kind test */
// @vitest-environment jsdom
import { describe, expect, it, vi } from 'vitest';
import { act, createElement as h } from 'react';
import { CellPicker } from '@app/views/HudLayoutEditor/sub-components/CellPicker';
import type { HudGridContainer, HudNode } from '@rotp/hud';
import { installPanelHarness } from './install-panel-harness';

const { mount } = installPanelHarness();

const leaf = (id: string): HudNode => ({ id, kind: 'element', element: { type: 'spacer' } } as unknown as HudNode);

describe('the picker: an occupied cell is a destination, not a rejection', () => {
  const PARENT = {
    id: 'badge',
    kind: 'container',
    layout: 'grid',
    columns: ['auto', 'auto'],
    rows: ['auto', 'auto'],
    children: [
      { ...leaf('life_pip'), place: { column: 1, row: 1 } },
      { ...leaf('shield'), place: { column: 2, row: 2 } },
    ],
  } as unknown as HudGridContainer;

  const cell = (column: number, row: number): HTMLElement => {
    const found = document.querySelector<HTMLElement>(`.hud-lattice__cell[data-column="${column}"][data-row="${row}"]`);
    if (!found) throw new Error(`no cell ${column},${row}`);
    return found;
  };

  const down = (el: Element): void => {
    act(() => {
      el.dispatchEvent(new MouseEvent('pointerdown', { bubbles: true, cancelable: true }));
    });
  };

  const mountLattice = (onChange: (place: HudNode['place']) => void): void => {
    mount(h(CellPicker, {
      container: PARENT, childId: 'shield', place: { column: 2, row: 2 }, onChange,
    }));
  };

  it('hatches the cell a sibling already holds, and names the occupant', () => {
    mountLattice(() => {});
    const taken = cell(1, 1);
    expect(taken.dataset.state).toBe('occupied');
    expect(taken.getAttribute('aria-label')).toBe('column 1, row 1 with life_pip');
  });

  it('lets a click on it place the node there instead of swallowing it', () => {
    const patch = vi.fn();
    mountLattice(patch);
    down(cell(1, 1));
    expect(patch).toHaveBeenCalledWith({ column: 1, row: 1 });
  });

  it('never counts the node\'s OWN cell as somebody else\'s', () => {
    mountLattice(() => {});
    expect(cell(2, 2).dataset.state).toBe('selected');
  });
});
