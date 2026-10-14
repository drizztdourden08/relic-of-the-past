/* @layer tests @kind test */
import { describe, it, expect, beforeAll } from 'vitest';
import { ONE_ROW, RAILS, SELECTIONS, measureRails } from '../layout-bands.harness';
import type { Box, Rig } from '../layout-bands.harness';
import { required } from '../../required';

let rig: Rig;

const partAt = (rail: number, kase: string, name: string): Box =>
  required(rig.at(rail, kase).parts[name], `${name} at ${rail}/${kase}`);
const selectionNames = Object.keys(SELECTIONS);

beforeAll(async () => {
  rig = await measureRails();
  return () => rig.close();
}, 60_000);

describe('the toolbar is ONE strip and ONE row, in every state and at every rail', () => {
  it('is exactly one row tall with nothing selected', () => {
    for (const rail of RAILS) {
      expect(`${rail} empty bar ${partAt(rail, 'state-none', 'hud-grid__bar').h}`)
        .toBe(`${rail} empty bar ${ONE_ROW}`);
    }
  });

  it('stays one row for every selection kind, which §54 could not say', () => {
    for (const rail of RAILS) {
      expect(`${rail} bars ${selectionNames.map((n) => partAt(rail, `state-${n}`, 'hud-grid__bar').h).join('/')}`)
        .toBe(`${rail} bars ${selectionNames.map(() => ONE_ROW).join('/')}`);
    }
  });

  it('keeps the LATTICE at exactly the same y in every state', () => {
    const top = (rail: number, name: string): number =>
      partAt(rail, `state-${name}`, 'hud-lattice__scroll').top;
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
