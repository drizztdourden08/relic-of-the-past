/* @layer tests @kind test */
import { describe, it, expect, beforeAll } from 'vitest';
import { measureLayout } from './measure-layout';
import type { LayoutRig } from './layout-widths.type';

const RAILS = [289, 232, 188];
let rig: LayoutRig;

beforeAll(async () => {
  rig = await measureLayout(RAILS);
  return () => rig.close();
}, 60_000);

describe('the alignment tiles, at the widths that broke the two rounds before', () => {
  const ALIGN_CASES = ['alignGrid', 'alignFlexRow', 'alignFlexColumn'];

  it('draws EVERY tile in a component at one size, at every rail (§56)', () => {
    for (const rail of RAILS) {
      for (const kase of ALIGN_CASES) {
        const widths = new Set(rig.at(rail, 'hud-align__diagram', kase).map((m) => m.width));
        expect(`${rail}/${kase} tile widths ${[...widths].join('/')}`)
          .toBe(`${rail}/${kase} tile widths ${[...widths][0]}`);
      }
    }
  });

  it('folds a six-option row into FULL lines of three - never a ragged wrap', () => {
    for (const rail of RAILS) {
      for (const kase of ALIGN_CASES) {
        const rows = rig.at(rail, 'hud-align__tiles', kase);
        const tiles = rig.at(rail, 'hud-align__diagram', kase);
        expect(`${rail}/${kase} rows ${rows.length}`).toBe(`${rail}/${kase} rows 2`);
        const perLine = new Map<number, number>();
        for (const t of tiles) perLine.set(Math.round(t.top), (perLine.get(Math.round(t.top)) ?? 0) + 1);
        const counts = new Set(perLine.values());
        expect(`${rail}/${kase} every line equally full ${counts.size === 1}`)
          .toBe(`${rail}/${kase} every line equally full true`);
      }
    }
  });

  it('stops growing at 72px instead of letterboxing the diagram', () => {
    for (const rail of RAILS) {
      for (const m of rig.at(rail, 'hud-align__diagram')) {
        expect(`${rail}/${m.case} tile ${m.width <= 72}`).toBe(`${rail}/${m.case} tile true`);
      }
    }
  });
});
