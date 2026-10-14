/* @layer tests @kind test */
import { describe, it, expect, beforeAll } from 'vitest';
import { measureAppearance } from './measure-appearance';
import type { AppearanceRig } from './appearance.type';
import { required } from '../../required';

const RAILS = [289, 232, 188];
let rig: AppearanceRig;

beforeAll(async () => {
  rig = await measureAppearance(RAILS);
  return () => rig.close();
}, 60_000);

describe('the colour row, in every place Appearance draws one', () => {
  it('leaves a whole #rrggbb typeable at 289 / 232 / 188, in all six', () => {
    const inGroup = ['background', 'border colour', 'outline colour', 'tint colour',
      'shadow 1 colour', 'shadow 2 colour'];
    for (const label of inGroup) {
      for (const rail of RAILS) {
        expect(`${rail}/${label} ${rig.hex(rail, 'expanded', label) > 100}`).toBe(`${rail}/${label} true`);
      }
    }
    for (const rail of RAILS) {
      expect(`${rail}/stop ${rig.hex(rail, 'ramp', 'stop 1') > 100}`).toBe(`${rail}/stop true`);
    }
  });

  it('is the same component in all of them', () => {
    expect(rig.at(289, 'hud-color-field', 'expanded').length).toBe(6);
    expect(rig.at(289, 'hud-color-field', 'ramp').length).toBe(1);
  });
});

describe("Appearance's own new controls", () => {
  it('draws the four border sides as a box, not four checkboxes in a run', () => {
    for (const rail of RAILS) {
      const box = required(rig.at(rail, 'hud-sides', 'sides')[0], 'the border sides box');
      expect(`${rail} sides ${box.width}x${box.height}`).toBe(`${rail} sides 46x34`);
    }
  });

  it('gives the gradient ramp the full row at every rail', () => {
    for (const rail of RAILS) {
      const track = required(rig.at(rail, 'hud-ramp__track', 'ramp')[0], 'the gradient ramp track');
      expect(`${rail} ramp ${track.width > rail - 40}`).toBe(`${rail} ramp true`);
      expect(`${rail} ramp height ${track.height}`).toBe(`${rail} ramp height 18`);
    }
  });

  it('costs the paint kind three icons instead of a full-width Select', () => {
    for (const rail of RAILS) {
      const kinds = required(rig.at(rail, 'hud-icon-choice', 'gradient')[0], 'the paint kind choice');
      expect(`${rail} kinds ${kinds.width}`).toBe(`${rail} kinds 88`);
    }
  });

  it('keeps four slot chips on one row at the default rail', () => {
    expect(required(rig.at(289, 'hud-slot-chips', 'chips')[0], 'the slot chips').lines).toBe(1);
  });
});

describe('every Appearance row, at 289 / 232 / 188 px', () => {
  it('never lets a control escape the rail, down to 188 px', () => {
    for (const rail of RAILS) {
      for (const m of rig.measured[rail] ?? []) {
        expect(`${rail}/${m.case}/${m.kind} overflow ${m.overflow}`)
          .toBe(`${rail}/${m.case}/${m.kind} overflow 0`);
      }
    }
  });

  it('keeps every label and hint on one line, down to the 188 px minimum', () => {
    for (const rail of RAILS) {
      for (const m of [...rig.at(rail, 'field__label'), ...rig.at(rail, 'field__hint')]) {
        expect(`${rail}/${m.case}/${m.name} lines ${m.lines}`).toBe(`${rail}/${m.case}/${m.name} lines 1`);
      }
    }
  });
});
