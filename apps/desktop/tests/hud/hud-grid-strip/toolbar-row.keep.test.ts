/* @layer tests @kind test */
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { ONE_ROW, RAILS, SELECTIONS, measureRails } from '../layout-bands.harness';
import type { Rig } from '../layout-bands.harness';

let rig: Rig;
const selectionNames = Object.keys(SELECTIONS);

beforeAll(async () => { rig = await measureRails(); }, 60_000);
afterAll(async () => { await rig?.close(); });

describe('the toolbar is ONE strip and ONE row, in every state and at every rail', () => {
  it('is exactly one row tall with nothing selected', () => {
    for (const rail of RAILS) {
      expect(`${rail} empty bar ${rig.at(rail, 'state-none').parts['hud-grid__bar'].h}`)
        .toBe(`${rail} empty bar ${ONE_ROW}`);
    }
  });

  it('stays one row for every selection kind, which §54 could not say', () => {
    for (const rail of RAILS) {
      expect(`${rail} bars ${selectionNames.map((n) => rig.at(rail, `state-${n}`).parts['hud-grid__bar'].h).join('/')}`)
        .toBe(`${rail} bars ${selectionNames.map(() => ONE_ROW).join('/')}`);
    }
  });

  it('keeps the LATTICE at exactly the same y in every state', () => {
    const top = (rail: number, name: string): number =>
      rig.at(rail, `state-${name}`).parts['hud-lattice__scroll'].top;
    for (const rail of RAILS) {
      expect(`${rail} shifts ${selectionNames.map((n) => top(rail, n) - top(rail, 'none')).join('/')}`)
        .toBe(`${rail} shifts 0/0/0/0`);
    }
  });

  it('leads with a chip that names the selection, or a hint when there is none', () => {
    for (const rail of RAILS) {
      const none = rig.at(rail, 'state-none');
      expect(`${rail}/none hint ${none.parts['hud-grid__bar-hint'] !== undefined}`)
        .toBe(`${rail}/none hint true`);
      expect(`${rail}/none chip ${none.parts['hud-grid__bar-chip'] !== undefined}`)
        .toBe(`${rail}/none chip false`);
      for (const name of ['cell', 'column', 'row']) {
        const m = rig.at(rail, `state-${name}`);
        expect(`${rail}/${name} chip ${m.parts['hud-grid__bar-chip'] !== undefined}`)
          .toBe(`${rail}/${name} chip true`);
        expect(`${rail}/${name} hint ${m.parts['hud-grid__bar-hint'] !== undefined}`)
          .toBe(`${rail}/${name} hint false`);
      }
    }
  });
});
