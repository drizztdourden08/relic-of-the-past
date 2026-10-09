/* @layer tests @kind test */
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { readFileSync } from 'fs';
import {
  GRID_EDITOR_SRC, LAYOUT_SECTION_SRC, RAILS, layoutCases, measureRails,
} from './layout-bands.harness';
import type { Rig } from './layout-bands.harness';

let rig: Rig;

beforeAll(async () => { rig = await measureRails(); }, 60_000);
afterAll(async () => { await rig?.close(); });

const strip = (path: string): string =>
  readFileSync(path, 'utf8').replace(/\/\*[\s\S]*?\*\//g, '');

describe('the section takes the height its clarity costs, and says how much', () => {
  it('measures a grid container against the four passes before it', () => {
    expect(RAILS.map((rail) => rig.at(rail, 'sectionGrid').height)).toEqual([455, 455, 413]);
  });

  it('records what a flex container COST, because it is taller than before', () => {
    expect(RAILS.map((rail) => rig.at(rail, 'sectionFlex').height)).toEqual([358, 358, 330]);
  });

  it('lets nothing in the section escape the rail, down to the 220px floor', () => {
    for (const rail of RAILS) {
      for (const kase of Object.keys(layoutCases)) {
        expect(`${rail}/${kase} overflow ${rig.at(rail, kase).overflow}`)
          .toBe(`${rail}/${kase} overflow 0`);
      }
    }
  });
});

describe('the composed block is still the shape the real components render', () => {
  it('names the same three bands, in the same order, and nothing else', () => {
    const src = strip(GRID_EDITOR_SRC);
    const order = ['<SelectionToolbar', '<GridLattice', '<SelectionLegend'];
    const found = order.map((needle) => src.indexOf(needle));
    expect(found.some((i) => i < 0)).toBe(false);
    expect([...found].sort((a, b) => a - b)).toEqual(found);
    for (const ghost of ['persistent', 'GridProperties', 'GridSettings', 'hud-grid__title', 'controls=']) {
      expect(`${ghost} in GridEditor: ${src.includes(ghost)}`).toBe(`${ghost} in GridEditor: false`);
    }
  });

  it('mounts §55\'s three sub-sections from LayoutSection, in the brief\'s order', () => {
    const src = strip(LAYOUT_SECTION_SRC);
    const order = ['<LayoutSettings', '<FlowSettings', '<AlignmentTiles', 'manipulation'];
    expect(src).toMatch(/<LayoutSettings[\s\S]*?engine=/);
    expect(src).toMatch(/<AlignmentTiles[\s\S]*?rows=/);
    expect(src).toMatch(/<GridEditor[\s\S]*?<FlexEditor/);
    const found = order.map((needle) => src.indexOf(needle));
    expect(found.some((i) => i < 0)).toBe(false);
    expect([...found].sort((a, b) => a - b)).toEqual(found);
    for (const ghost of ['GridTemplateEditor', 'ContainerInspector']) {
      expect(`${ghost} in LayoutSection: ${src.includes(ghost)}`)
        .toBe(`${ghost} in LayoutSection: false`);
    }
  });
});
