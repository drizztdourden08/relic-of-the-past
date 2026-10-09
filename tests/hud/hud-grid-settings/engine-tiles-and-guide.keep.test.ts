/* @layer tests @kind test */
// @vitest-environment jsdom
import { describe, expect, it, vi } from 'vitest';
import { installLayoutSectionRig } from './install-layout-section-rig';

const { mountGrid, pick, click, states } = installLayoutSectionRig();

describe('every other property still writes what §50 said it wrote', () => {
  it('flips the engine from section ONE\'s own pair (§56)', () => {
    const patch = vi.fn();
    mountGrid(patch);
    click(pick('.hud-layout-set [data-engine="flex"]'));
    expect(patch).toHaveBeenCalledWith(expect.objectContaining({ layout: 'flex' }));
  });

  it('writes exactly its own value from each tile, in every selection state', () => {
    const patch = vi.fn();
    mountGrid(patch);
    for (const select of Object.values(states)) {
      select();
      for (const value of ['start', 'center', 'end', 'stretch']) {
        patch.mockClear();
        click(document.querySelector(`[data-align="justifyItems:${value}"]`));
        expect(patch).toHaveBeenCalledWith({ justifyItems: value });
        patch.mockClear();
        click(document.querySelector(`[data-align="alignItems:${value}"]`));
        expect(patch).toHaveBeenCalledWith({ alignItems: value });
      }
    }
  });

  it('opens the guide picker from a bare swatch with no hex box beside it', () => {
    mountGrid();
    const swatch = pick<HTMLElement>('.hud-layout-set__overlay .color-swatch');
    expect(swatch.getAttribute('aria-label')).toBe('Open the guide colour picker');
    expect(document.querySelector('[aria-label="guide hex"]')).toBeNull();
    click(swatch);
    expect(document.querySelector('.color-picker')).not.toBeNull();
  });
});
