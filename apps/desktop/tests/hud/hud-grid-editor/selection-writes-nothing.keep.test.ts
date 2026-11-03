/* @layer tests @kind test */
// @vitest-environment jsdom
import { describe, expect, it, vi } from 'vitest';
import { installGridRig } from './install-grid-rig';

const { cell, down, enter, up, mountGrid } = installGridRig();

describe('selecting a cell writes NOTHING, fixing the bug §50 was opened for', { tags: ['standard'] }, () => {
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
});
