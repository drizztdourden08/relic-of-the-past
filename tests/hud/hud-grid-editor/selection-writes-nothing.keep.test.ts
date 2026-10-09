/* @layer tests @kind test */
// @vitest-environment jsdom
import { describe, expect, it, vi } from 'vitest';
import { readFileSync } from 'fs';
import { gridActions } from '../../../apps/desktop/src/ui/domains/app/views/HudLayoutEditor/sub-components/GridEditor/behavior/grid-actions';
import type {
  GridSelection,
} from '../../../apps/desktop/src/ui/domains/app/views/HudLayoutEditor/sub-components/GridEditor/GridEditor.type';
import { EDITOR } from './grid-editor.constants';
import { actionContext as ctxFor } from './action-context';
import { installGridRig } from './install-grid-rig';
import { screenRoot } from './screen-root';

const { cell, down, enter, up, mountGrid } = installGridRig();

describe('selecting a cell writes NOTHING, fixing the bug §50 was opened for', () => {
  it('leaves the document byte-identical through click, modifier, shift and drag', () => {
    const patch = vi.fn();
    mountGrid(patch);
    down(cell(1, 1));
    down(cell(2, 2), { ctrlKey: true });
    down(cell(3, 3), { shiftKey: true });
    down(cell(1, 1));
    enter(cell(2, 2));
    enter(cell(3, 3));
    up(cell(3, 3));
    expect(patch).not.toHaveBeenCalled();
    expect(document.querySelectorAll('.hud-lattice__cell[aria-selected="true"]').length).toBe(9);
  });

  it('takes no prop that could write a child, and offers no child row anywhere', () => {
    const src = readFileSync(`${EDITOR}/sub-components/GridEditor/GridEditor.tsx`, 'utf8');
    expect(src).not.toContain('onPatchNode');
    expect(src).not.toContain('activeChildId');
    const table = readFileSync(`${EDITOR}/sub-components/GridEditor/behavior/grid-actions.ts`, 'utf8');
    for (const word of ['patchChild', 'place-active', 'span-occupant', 'clear-span', 'align-self']) {
      expect(`${word} in the table: ${table.includes(word)}`).toBe(`${word} in the table: false`);
    }
    const selection: GridSelection[] = [
      { kind: 'none' },
      { kind: 'cells', cells: [{ column: 1, row: 1 }], anchor: { column: 1, row: 1 } },
      { kind: 'track', axis: 'columns', indices: [0], anchor: 0 },
      { kind: 'track', axis: 'rows', indices: [1], anchor: 1 },
    ];
    for (const sel of selection) {
      const keys = gridActions(ctxFor(sel, screenRoot())).map((a) => a.key);
      for (const banned of ['place-active', 'span-occupant', 'move', 'span', 'clear-span', 'align-self', 'occupant-name']) {
        expect(`${sel.kind}/${banned} ${keys.includes(banned)}`).toBe(`${sel.kind}/${banned} false`);
      }
    }
  });

  it('still draws the occupancy, so a track edit\'s blast radius is visible', () => {
    mountGrid();
    expect(Array.from(document.querySelectorAll('.hud-lattice__occupant')).map((el) => el.textContent))
      .toEqual(['vitals', 'wallet']);
    const sheet = readFileSync(`${EDITOR}/sub-components/GridLattice/HudLayoutEditor.lattice.css`, 'utf8');
    expect(sheet).toMatch(/\.hud-lattice__occupant\s*\{[^}]*pointer-events:\s*none/);
  });
});
