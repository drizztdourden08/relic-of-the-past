/* @layer tests @kind test */
// @vitest-environment jsdom
import { describe, expect, it, vi } from 'vitest';
import { createElement as h } from 'react';
import { EditorStepContext } from '@app/hud-layout-editing/editor-step';
import { LayoutSection } from '@app/views/HudLayoutEditor/sub-components/sections/LayoutSection';
import type { HudContainer, HudNode, Value } from '@rotp/hud';
import { installLayoutSectionRig } from './install-layout-section-rig';
import { screenRoot } from './screen-root';

const { mount, mountGrid, pick, header, down, click, bar, field, type, enter } = installLayoutSectionRig();

const ignore = (): void => {};

describe('the tracks are edited on the drawing they belong to', () => {
  it('appends a column and a row from the lattice\'s own trailing `+`s', () => {
    const patch = vi.fn();
    mountGrid(patch);
    click(pick('.hud-lattice__add--columns'));
    expect(patch).toHaveBeenLastCalledWith(expect.objectContaining({
      columns: ['auto', 'fill', 'auto', 'auto'],
    }));
    click(pick('.hud-lattice__add--rows'));
    expect(patch).toHaveBeenLastCalledWith(expect.objectContaining({
      rows: ['auto', 'fill', 'auto', 'auto'],
    }));
    expect((patch.mock.calls[1][0].children as HudNode[]).map((c) => c.place))
      .toEqual([{ column: 1, row: 1 }, { column: 1, row: 3 }]);
  });

  it('turns the SELECTED header\'s own label into its size menu', () => {
    const patch = vi.fn();
    mountGrid(patch);
    expect(header('column 2').querySelector('[data-action="size"]')).toBeNull();
    expect(header('column 2').textContent).toBe('fill');
    down(header('column 2'));
    const size = header('column 2').querySelector<HTMLElement>('[data-action="size"]');
    expect(size?.textContent).toBe('fill▾');
    click(size);
    click(Array.from(document.querySelectorAll('.dropdown__item'))
      .find((el) => (el.textContent ?? '').startsWith('px')));
    expect(patch).toHaveBeenLastCalledWith(expect.objectContaining({
      columns: ['auto', { px: 0 }, 'auto'],
    }));
  });

  it('inserts from the toolbar through the same document rule', () => {
    const patch = vi.fn();
    mountGrid(patch);
    down(header('column 2'));
    click(bar().querySelector('[data-action="insert-before"]'));
    expect(patch).toHaveBeenCalledTimes(1);
    expect(patch.mock.calls[0][0].columns).toEqual(['auto', 'auto', 'fill', 'auto']);
  });
});

describe('the gap is the numeric input this panel already had (§56)', () => {
  it('is a `ValueField` with its own spinner, and no second control around it', () => {
    const patch = vi.fn();
    mountGrid(patch, screenRoot({ x: 2, y: 2 }));
    expect(document.querySelector('.hud-step')).toBeNull();
    expect(field('gap x').closest('.hud-value-field')).not.toBeNull();
    click(pick('[aria-label="Increment gap x"]'));
    expect(patch).toHaveBeenLastCalledWith({ gap: { x: 3, y: 2 } });
  });

  it('moves by the editor\'s step when the View says so', () => {
    const patch = vi.fn();
    mount(h(EditorStepContext.Provider, { value: 4 }, h(LayoutSection, {
      node: screenRoot({ x: 2, y: 2 }) as unknown as HudContainer,
      onPatch: patch as (next: Partial<HudContainer>) => void,
      scope: {},
    })));
    click(pick('[aria-label="Increment gap x"]'));
    expect(patch).toHaveBeenLastCalledWith({ gap: { x: 6, y: 2 } });
    click(pick('[aria-label="Decrement gap y"]'));
    expect(patch).toHaveBeenLastCalledWith({ gap: { x: 2, y: 0 } });
  });

  it('writes a literal typed into one axis and leaves the other alone', () => {
    const patch = vi.fn();
    mountGrid(patch, screenRoot({ x: 2, y: 2 }));
    expect(field('gap x').value).toBe('2');
    type('gap x', '6');
    expect(patch).toHaveBeenCalledWith({ gap: { x: 6, y: 2 } });
  });

  it('writes a formula on commit, exactly as any other ValueInput does', () => {
    const patch = vi.fn();
    mountGrid(patch, screenRoot({ x: 2, y: 2 }));
    type('gap y', '= life_current');
    expect(patch).not.toHaveBeenCalled();
    enter('gap y');
    expect(patch).toHaveBeenCalledWith({ gap: { x: 2, y: { from: 'data', expr: 'life_current' } } });
  });

  it('shows a stored expression back with its marker, and drops the spinner', () => {
    const bound: Value = { from: 'data', expr: 'ceil(life_max / 8)' };
    mountGrid(ignore, screenRoot({ x: bound, y: 0 }));
    expect(field('gap x').value).toBe('= ceil(life_max / 8)');
    expect(field('gap x').closest('.hud-value-input')?.getAttribute('data-formula')).toBe('true');
    expect(document.querySelector('[aria-label="Increment gap x"]')).toBeNull();
  });
});
