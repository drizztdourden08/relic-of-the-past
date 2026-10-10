/* @layer tests @kind test */
import { describe, it, expect, beforeAll } from 'vitest';
import { measureAppearance } from './measure-appearance';
import type { AppearanceRig } from './appearance.type';

const RAILS = [289, 232, 188];
let rig: AppearanceRig;

beforeAll(async () => {
  rig = await measureAppearance(RAILS);
  return () => rig.close();
}, 60_000);

describe('the longest section, collapsed', () => {
  it('fits one screen with every group closed and everything enabled', () => {
    for (const rail of RAILS) {
      const body = rig.at(rail, 'hud-inspect__group', 'section')[0];
      expect(`${rail} collapsed ${body.height < 500}`).toBe(`${rail} collapsed true`);
    }
  });

  it('is a fraction of the same controls left uncollapsed', () => {
    for (const rail of RAILS) {
      const sum = (kase: string): number =>
        rig.at(rail, 'hud-subgroup', kase).reduce((total, m) => total + m.height, 0);
      const closed = sum('section');
      const open = sum('expanded');
      expect(`${rail} groups closed ${closed < open / 3}`).toBe(`${rail} groups closed true`);
    }
  });

  it('spends one line per group, whatever the value in it', () => {
    for (const rail of RAILS) {
      expect(`${rail} groups ${rig.at(rail, 'hud-subgroup__head', 'section').length}`).toBe(`${rail} groups 6`);
      for (const s of rig.at(rail, 'hud-subgroup__summary', 'section')) {
        expect(`${rail} summary lines ${s.lines}`).toBe(`${rail} summary lines 1`);
      }
    }
  });

  it('states each group value in its own header, closed', () => {
    const summaries = rig.at(289, 'hud-subgroup__summary', 'section').map((m) => m.name);
    expect(summaries).toEqual([
      '#101010', '2px solid, no left', '1px, ink', 'multiply 1', '0 2 4 #000000', '0 0 8 #c8a84e inset',
    ]);
  });

  it('draws a colour chip beside every group that has one', () => {
    expect(rig.at(289, 'hud-subgroup__swatch', 'section').length).toBe(6);
    for (const chip of rig.at(188, 'hud-subgroup__swatch', 'section')) expect(chip.width).toBe(16);
  });
});
