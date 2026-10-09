/* @layer tests @kind test */
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { measureGeometry } from './measure-geometry';
import type { GeometryRig, Measured } from './geometry-width.type';

const RAILS = [289, 232, 188];
let rig: GeometryRig;

const named = (rail: number, name: string): Measured => {
  const hit = rig.measured[rail]?.find((m) => m.name === name);
  if (!hit) throw new Error(`no "${name}" measured at ${rail}px`);
  return hit;
};

beforeAll(async () => { rig = await measureGeometry(RAILS); }, 60_000);

afterAll(async () => { await rig?.close(); });

describe('the box model answers the four-spinner row it replaces', () => {
  it('gives every margin edge a typing surface at the 188 px minimum', () => {
    for (const side of ['top', 'right', 'bottom', 'left']) {
      const edge = named(188, `margin ${side}`);
      expect(`${side} ${edge.content > 18}`).toBe(`${side} true`);
    }
  });

  it('widens every edge with the rail instead of pinning a fixed column', () => {
    for (const side of ['top', 'right', 'bottom', 'left']) {
      expect(named(289, `margin ${side}`).content).toBeGreaterThan(named(188, `margin ${side}`).content);
      expect(named(289, `padding ${side}`).content).toBeGreaterThan(20);
    }
  });

  it('keeps the inner ring inside the outer one at every rail', () => {
    for (const rail of RAILS) {
      expect(named(rail, 'padding left').width).toBeLessThanOrEqual(named(rail, 'margin left').width);
    }
  });
});

describe('the section is half the height it was', () => {
  it('draws the whole of Size & box in under 450 px, at every rail', () => {
    for (const rail of RAILS) {
      expect(`${rail}px: ${rig.heights[rail].sizebox < 450}`).toBe(`${rail}px: true`);
    }
    expect(rig.heights[289].sizebox).toBe(rig.heights[188].sizebox);
  });
});

describe('the new geometry controls, at 289 / 232 / 188 px', () => {
  it('never lets a control escape the rail, down to the minimum', () => {
    for (const rail of RAILS) {
      for (const m of rig.measured[rail] ?? []) {
        expect(`${rail}/${m.case}/${m.kind}/${m.name} overflow ${m.overflow}`)
          .toBe(`${rail}/${m.case}/${m.kind}/${m.name} overflow 0`);
      }
    }
  });

  it('keeps every Field label on one line', () => {
    for (const rail of RAILS) {
      for (const m of (rig.measured[rail] ?? []).filter((x) => x.kind === 'field__label')) {
        expect(`${rail}/${m.case}/${m.name} lines ${m.lines}`).toBe(`${rail}/${m.case}/${m.name} lines 1`);
      }
    }
  });

  it('leaves the offset pair typeable at the minimum rail', () => {
    const fields = (rig.measured[188] ?? []).filter((m) => m.case === 'offset' && m.kind === 'number-input__field');
    expect(fields.length).toBe(2);
    for (const f of fields) expect(f.content).toBeGreaterThan(35);
  });

  it('leaves both limits on one row per axis, with room to type in each', () => {
    const fields = (rig.measured[188] ?? []).filter((m) => m.case === 'limits' && m.kind === 'text-input');
    expect(fields.length).toBe(4);
    for (const f of fields) expect(f.content).toBeGreaterThan(45);
  });

  it('draws a lattice whose cells clear the 24 px target floor on BOTH axes', () => {
    const cells = (rig.measured[188] ?? []).filter((m) => m.case === 'cell' && m.kind === 'hud-lattice__cell');
    expect(cells.length).toBe(6);
    for (const c of cells) expect(c.width).toBeGreaterThanOrEqual(24);
    for (const c of cells) expect(c.height).toBeGreaterThanOrEqual(24);
  });
});
