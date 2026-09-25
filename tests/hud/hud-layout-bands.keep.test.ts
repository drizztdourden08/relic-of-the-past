/* @layer tests @kind test */
/**
 * The TOTALS half of §55's Layout section, MEASURED. The geometry of the three
 * sub-sections and the contextual strip is `hud-grid-strip.keep.test.ts`; both
 * read the same rig (`layout-bands.harness.ts`), which is why neither is
 * squeezed.
 *
 * WHAT THIS FILE CLAIMS:
 *
 * 1. THE SECTION'S OWN HEIGHT, pinned against §54's, §51's and §50's. §55 is
 *    SHORTER than §54 by about a quarter for a grid, and the saving is not a
 *    trade against clarity: it is three frames, a duplicated heading, five
 *    `Field` label lines and a whole `TRACKS` row that stopped existing.
 * 2. NOTHING ESCAPES THE RAIL, down to the 220px the rail can actually reach.
 * 3. AND THE COMPOSED BLOCK IS STILL THE SHAPE `GridEditor` RENDERS. The rig is
 *    a replica (SSR cannot click), so the band order is grepped out of the real
 *    component instead of agreed with it, and `LayoutSection`'s three
 *    sub-sections are grepped out of ITS source for the same reason.
 */
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { readFileSync } from 'fs';
import {
  CASES, GRID_EDITOR_SRC, LAYOUT_SECTION_SRC, RAILS, measureRails,
} from './layout-bands.harness';
import type { Rig } from './layout-bands.harness';

let rig: Rig;

beforeAll(async () => { rig = await measureRails(); }, 60_000);
afterAll(async () => { await rig?.close(); });

const strip = (path: string): string =>
  readFileSync(path, 'utf8').replace(/\/\*[\s\S]*?\*\//g, '');

describe('the section takes the height its clarity costs, and says how much', () => {
  it('measures a grid container against the four passes before it', () => {
    // §50: 689.5 / 689.5 / 637.0. §51: 474.5 / 414.5 / 399.5. §54: 579 / 579 /
    // 564. §55: 447 / 447 / 433. §56 SPLITS: 455 / 455 / 413. That is 8px TALLER at the
    // two narrow rails and 20px SHORTER at the default one, and the split is
    // the whole point of measuring it.
    //
    // WHAT IT SPENT, at every rail: the alignment component is two 32px tile
    // rows where the 3x3 pad was one 82px square, which is a wash, and section
    // one gained three labels. They sit beside their controls, so they cost width.
    // WHAT IT BOUGHT, at 320 only: every piece of section one on ONE line,
    // because nothing in it is taller than a row any more. At 220 and 232 the
    // three pieces need two lines and the gap field's 28px is 2px more than the
    // 26px rows it sits beside, which is where the 8 comes from.
    //
    // It is NOT the same at every rail on purpose, and this is the second
    // reason for that after §55.1's legend: a layout packed by measured width
    // is supposed to give a different answer at a different width.
    expect(RAILS.map((rail) => rig.at(rail, 'sectionGrid').height)).toEqual([455, 455, 413]);
  });

  it('records what a flex container COST, because it is taller than before', () => {
    // §51/§54: 152 / 124 / 124 (at 188 / 232 / 320). §55: 150 at every rail.
    // §56: 164, then 198 once the six main-axis tiles folded to two lines.
    // §58: 362 / 362 / 334, and every pixel of the +164 is the maintainer's
    // own list:
    //
    // - A FLEX MANIPULATION SECTION, which did not exist: a title and rule, the
    //   contextual strip, the strip of child cells and the legend. "the flex
    //   should have a manipulation section as well. same principle."
    // - FLOW became its own titled section instead of a line above the tiles,
    //   because `direction` turns those tiles and a section may not rearrange
    //   itself when one of its own options is pressed.
    // - Section one gained the second gap cell and the Overlay piece, which is
    //   what makes it the SAME section under both engines. It is also why 320 is
    //   28px shorter than the narrow rails instead of equal to them: at 320 the
    //   three pieces still share two lines where 232 needs three.
    //
    // The grid's own 455 / 455 / 413 is UNCHANGED by all of it, which is the
    // other half of the claim: nothing was taken from the grid to pay for this.
    expect(RAILS.map((rail) => rig.at(rail, 'sectionFlex').height)).toEqual([358, 358, 330]); // the strip's 2px sunken well is gone
  });

  it('lets nothing in the section escape the rail, down to the 220px floor', () => {
    for (const rail of RAILS) {
      for (const kase of Object.keys(CASES)) {
        expect(`${rail}/${kase} overflow ${rig.at(rail, kase).overflow}`)
          .toBe(`${rail}/${kase} overflow 0`);
      }
    }
  });
});

describe('the composed block is still the shape the real components render', () => {
  it('names the same three bands, in the same order, and nothing else', () => {
    // The day a band is added, moved or dropped in the real component, this fails
    // instead of the numbers silently measuring something no longer on screen.
    const src = strip(GRID_EDITOR_SRC);
    const order = ['<SelectionToolbar', '<GridLattice', '<SelectionLegend'];
    const found = order.map((needle) => src.indexOf(needle));
    expect(found.some((i) => i < 0)).toBe(false);
    expect([...found].sort((a, b) => a - b)).toEqual(found);
    // §51's `persistent` prop, §54's settings panel, its heading box and the
    // `control` slot the strip used to carry are all gone from this file.
    for (const ghost of ['persistent', 'GridProperties', 'GridSettings', 'hud-grid__title', 'controls=']) {
      expect(`${ghost} in GridEditor: ${src.includes(ghost)}`).toBe(`${ghost} in GridEditor: false`);
    }
  });

  it('mounts §55\'s three sub-sections from LayoutSection, in the brief\'s order', () => {
    const src = strip(LAYOUT_SECTION_SRC);
    // §58: FOUR sections, one concern each, in the order Layout · Flow · Alignment ·
    // manipulation. Grepped instead of agreed with, like the band order above.
    const order = ['<LayoutSettings', '<FlowSettings', '<AlignmentTiles', 'manipulation'];
    expect(src).toMatch(/<LayoutSettings[\s\S]*?engine=/);
    expect(src).toMatch(/<AlignmentTiles[\s\S]*?rows=/);
    // Both manipulation components hang off one slot, under a title that names
    // whichever engine is in force.
    expect(src).toMatch(/<GridEditor[\s\S]*?<FlexEditor/);
    const found = order.map((needle) => src.indexOf(needle));
    expect(found.some((i) => i < 0)).toBe(false);
    expect([...found].sort((a, b) => a - b)).toEqual(found);
    // The two wrappers §54 needed are not mounted from anywhere any more.
    for (const ghost of ['GridTemplateEditor', 'ContainerInspector']) {
      expect(`${ghost} in LayoutSection: ${src.includes(ghost)}`)
        .toBe(`${ghost} in LayoutSection: false`);
    }
  });
});
