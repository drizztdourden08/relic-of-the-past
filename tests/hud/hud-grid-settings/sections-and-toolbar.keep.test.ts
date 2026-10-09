/* @layer tests @kind test */
// @vitest-environment jsdom
import { describe, expect, it } from 'vitest';
import { readFileSync } from 'fs';
import { SUB } from './grid-settings.constants';
import { installLayoutSectionRig } from './install-layout-section-rig';

const { mountGrid, pick, cell, header, down, properties, bar, states } = installLayoutSectionRig();

describe('the property sections cannot change, because they cannot see a selection', () => {
  it('renders byte-identical markup with nothing, a cell, a column and a row picked', () => {
    mountGrid();
    const expected = properties();
    expect(Array.from(document.querySelectorAll('.hud-subsec__title')).map((el) => el.textContent))
      .toEqual(['Container', 'Alignment', 'Grid manipulation']);
    expect(expected).toContain('aria-label="gap x"');
    expect(expected).toContain('data-action="grid-overlay"');
    expect(expected).toContain('data-engine="grid"');
    expect(expected).toContain('data-align="justifyItems:stretch"');
    for (const [name, select] of Object.entries(states)) {
      select();
      expect(`${name} ${properties()}`).toBe(`${name} ${expected}`);
    }
  });

  it('is handed no selection, and has no prop that could carry one', () => {
    for (const file of ['LayoutSettings.tsx', 'LayoutSettings.type.ts', 'FlowSettings.tsx', 'AlignmentTiles.tsx']) {
      const src = readFileSync(`${SUB}/${file}`, 'utf8')
        .replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*$/gm, '');
      for (const word of ['selection', 'Selection', 'cursor', 'occupants', 'GridActionContext']) {
        expect(`${word} in ${file}: ${src.includes(word)}`).toBe(`${word} in ${file}: false`);
      }
    }
  });

  it('boxes nothing, and leads with the type (§56)', () => {
    mountGrid();
    expect(pick('.hud-subsec').querySelectorAll('.field__label').length).toBe(0);
    const body = pick('.hud-subsec__body');
    expect(body.firstElementChild?.className).toContain('hud-layout-set');
    expect(pick('.hud-layout-set').firstElementChild?.querySelector('[data-engine]'))
      .not.toBeNull();
  });
});

describe('the toolbar is the selection\'s, and holds no property and no field', () => {
  const PROPERTIES = ['engine', 'guide', 'grid-overlay', 'add-column', 'add-row', 'align-extra'];

  it('has no property and no input in any of the four states', () => {
    mountGrid();
    for (const [name, select] of Object.entries(states)) {
      select();
      const inside = Array.from(bar().querySelectorAll('[data-action]'))
        .map((el) => (el as HTMLElement).dataset.action ?? '?');
      for (const banned of PROPERTIES) {
        expect(`${name}/${banned} in the toolbar: ${inside.includes(banned)}`)
          .toBe(`${name}/${banned} in the toolbar: false`);
      }
      expect(bar().querySelector('[data-engine]')).toBeNull();
      expect(bar().querySelector('.color-swatch')).toBeNull();
      expect(`${name} inputs ${bar().querySelectorAll('input, .field').length}`)
        .toBe(`${name} inputs 0`);
    }
  });

  it('names what it is acting on, and prints a hint when it is acting on nothing', () => {
    mountGrid();
    const chip = (): string | null => bar().querySelector('.hud-grid__bar-chip')?.textContent ?? null;
    expect(chip()).toBeNull();
    expect(bar().querySelector('.hud-grid__bar-hint')?.textContent)
      .toBe('select a cell, column or row');
    down(header('column 2'));
    expect(chip()).toBe('column 2');
    down(cell(1, 1));
    down(cell(3, 1), { shiftKey: true });
    expect(chip()).toBe('3 cells');
    expect(bar().querySelector('.hud-grid__bar-hint')).toBeNull();
  });

  it('offers only the selection\'s own actions, and size is not among them', () => {
    mountGrid();
    const keys = (): string[] => Array.from(bar().querySelectorAll('[data-action]'))
      .map((el) => (el as HTMLElement).dataset.action ?? '?');
    expect(keys()).toEqual([]);
    down(cell(2, 2));
    expect(keys()).toEqual([
      'insert-column-before', 'insert-column-after', 'insert-row-before', 'insert-row-after',
    ]);
    down(header('column 2'));
    expect(keys()).toEqual(['move-earlier', 'move-later', 'insert-before', 'insert-after', 'remove']);
  });
});
