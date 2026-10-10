/* @layer tests @kind test */
// @vitest-environment jsdom
import { describe, expect, it, vi } from 'vitest';
import { act, createElement as h } from 'react';
import { layoutHud, placedById, validateLayout } from '@rotp/hud';
import { ScreenWindow } from '@drizztdourden08/tessera/composites';
import { GridEditor } from '@app/views/HudLayoutEditor/sub-components/GridEditor';
import { patchNode } from '@app/hud-layout-editing/node-edits';
import type { HudGridContainer, HudLayout, HudNode } from '@rotp/hud';
import { VIEW } from './grid-editor.constants';
import { installGridRig } from './install-grid-rig';
import { screenRoot } from './screen-root';

const { mount, cell, header, down, press, toolbarKeys, status, mountGrid } = installGridRig();

const ignore = (): void => {};

describe('every shortcut does what the legend draws', () => {
  it('moves a selected column with the arrow on the cap', () => {
    const patch = vi.fn();
    mountGrid(patch);
    down(header('column 2'));
    expect(document.querySelector('.hud-grid__key[data-shortcut="move-earlier"]')?.textContent)
      .toContain('Left arrow');
    press('ArrowLeft');
    expect(patch).toHaveBeenCalledTimes(1);
    expect(patch.mock.calls[0][0].columns).toEqual(['fill', 'auto', 'auto']);
  });

  it('removes a column on Del, WITHOUT asking whether a child is in the way', () => {
    const patch = vi.fn();
    mountGrid(patch);
    down(header('column 1'));
    expect(status()).toBe('column 1 of 3 holds vitals, wallet');
    press('Delete');
    expect(patch).toHaveBeenCalledTimes(1);
    const written = patch.mock.calls[0][0] as HudGridContainer;
    expect(written.columns).toEqual(['fill', 'auto']);
    expect(written.children.map((c) => c.place)).toEqual([
      { column: 1, row: 1 }, { column: 1, row: 3 },
    ]);
  });

  it('refuses only the one structural floor, and says so', () => {
    const patch = vi.fn();
    mount(h(GridEditor, {
      container: { ...screenRoot(), columns: ['auto'], children: [] },
      scope: {}, onPatchContainer: patch,
    }));
    down(header('column 1'));
    press('Delete');
    expect(patch).not.toHaveBeenCalled();
    expect(status()).toBe('A grid needs at least one column.');
    expect(toolbarKeys()).toContain('remove');
  });

  const picked = (): number => document.querySelectorAll('.hud-lattice__cell[aria-selected="true"]').length;

  it('collects cells with the primary modifier and extends a rectangle with shift', () => {
    mountGrid();
    down(cell(2, 1));
    expect(picked()).toBe(1);
    down(cell(3, 1), { ctrlKey: true });
    expect(picked()).toBe(2);
    down(cell(3, 3), { shiftKey: true });
    expect(picked()).toBe(3);
  });
});

describe('Escape clears the selection and leaves the editor standing', () => {
  it('answers with the lattice, not with the layer behind it (§33)', () => {
    mount(h(ScreenWindow, { onClose: ignore, title: 'HUD Layout Editor' },
      h(GridEditor, { container: screenRoot(), scope: {}, onPatchContainer: ignore })));
    down(cell(2, 2));
    expect(document.querySelectorAll('.hud-lattice__cell[aria-selected="true"]').length).toBe(1);
    act(() => {
      document.body.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true }));
    });
    expect(document.querySelectorAll('.hud-lattice__cell[aria-selected="true"]').length).toBe(0);
    expect(document.querySelector('.screen-layer')).not.toBeNull();
  });
});

describe('removing an occupied column survives the validator and the engine', () => {
  it('drops the screen\'s first band and lands both children in the new first one', () => {
    let doc: HudLayout = { id: 'grid-editor', name: 'Grid editor', builtIn: false, screen: screenRoot() };
    const before = layoutHud(validateLayout(doc).doc as HudLayout, VIEW, {});
    expect(placedById(before, 'wallet')?.rect.x).toBe(0);

    mount(h(GridEditor, {
      container: doc.screen as HudGridContainer,
      scope: {},
      onPatchContainer: (patch) => { doc = patchNode(doc, 'screen', patch as Partial<HudNode>); },
    }));
    down(header('column 1'));
    press('Delete');

    const parsed = validateLayout(JSON.parse(JSON.stringify(doc)) as unknown);
    expect(parsed.errors).toEqual([]);
    const placed = layoutHud(parsed.doc as HudLayout, VIEW, {});
    expect(placedById(placed, 'wallet')?.rect).toMatchObject({ x: 0, y: VIEW.h - 16 });
    expect(placedById(placed, 'vitals')?.rect).toMatchObject({ x: 0, y: 0 });
  });
});
