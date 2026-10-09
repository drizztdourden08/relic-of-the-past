/* @layer tests @kind test */
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { measureLayout } from './measure-layout';
import type { LayoutRig } from './layout-widths.type';

const RAILS = [289, 232, 188];
let rig: LayoutRig;

beforeAll(async () => { rig = await measureLayout(RAILS); }, 60_000);

afterAll(async () => { await rig?.close(); });

describe('every Layout row, at 289 / 232 / 188 px', () => {
  it('keeps each label and hint on one line, down to the 188 px minimum', () => {
    for (const rail of RAILS) {
      for (const m of [...rig.at(rail, 'field__label'), ...rig.at(rail, 'field__hint')]) {
        expect(`${rail}/${m.case}/${m.name} lines ${m.lines}`).toBe(`${rail}/${m.case}/${m.name} lines 1`);
      }
    }
  });

  it('never lets a Layout control escape the rail, down to 188 px', () => {
    for (const rail of RAILS) {
      for (const m of rig.measured[rail] ?? []) {
        expect(`${rail}/${m.case}/${m.kind}/${m.name} overflow ${m.overflow}`)
          .toBe(`${rail}/${m.case}/${m.kind}/${m.name} overflow 0`);
      }
    }
  });

  it('gives a 3-column lattice cells over the 24 px floor at every rail', () => {
    for (const rail of RAILS) {
      const cells = rig.at(rail, 'hud-lattice__cell', 'tracks');
      expect(`${rail} cells ${cells.length}`).toBe(`${rail} cells 6`);
      for (const c of cells) expect(`${rail} cell ${c.width >= 24}`).toBe(`${rail} cell true`);
    }
    for (const rail of RAILS) {
      for (const s of rig.at(rail, 'hud-lattice__scroll', 'tracks')) expect(s.scroll).toBe(0);
    }
  });

  it('leaves the picked track typeable beside its four tools, down to 188 px', () => {
    const tools = (rig.measured[188] ?? []).filter((m) => m.case === 'trackEditor' && m.kind === 'icon-btn');
    expect(tools.length).toBe(4);
    for (const t of tools) expect(t.width).toBe(28);
    const typing = (rig.measured[188] ?? [])
      .filter((m) => m.case === 'trackEditor' && /input/.test(m.kind));
    expect(typing.length).toBeGreaterThan(0);
    expect(Math.max(...typing.map((m) => m.content))).toBeGreaterThan(25);
  });

  it('draws the lattice at the full width of the rail it is in', () => {
    for (const rail of RAILS) {
      const lattice = rig.at(rail, 'hud-lattice__scroll', 'tracks')[0];
      expect(`${rail} lattice ${lattice.width > rail - 40}`).toBe(`${rail} lattice true`);
    }
  });

  it('leaves ColorField room for a whole #rrggbb, down to 188 px', () => {
    const hex = (rail: number): number => rig.at(rail, 'text-input', 'colour')[0].content;
    expect([hex(289), hex(232), hex(188)]).toEqual([241, 184, 140]);
  });

  it('keeps the two direction icons on one row', () => {
    for (const rail of RAILS) {
      const choice = rig.at(rail, 'hud-icon-choice', 'direction')[0];
      expect(`${rail} direction ${choice.width}`).toBe(`${rail} direction 58`);
      expect(choice.lines).toBe(1);
    }
  });
});
