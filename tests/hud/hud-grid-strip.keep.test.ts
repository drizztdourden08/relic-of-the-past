/* @layer tests @kind test */
/**
 * §55's three flat sections, MEASURED. This is the GEOMETRY half, on the rig in
 * `layout-bands.harness.ts`. The section's totals are
 * `hud-layout-bands.keep.test.ts`; the behaviour is `hud-grid-settings` in jsdom.
 *
 * EVERY CLAIM HERE IS ONE OF THE MAINTAINER'S SENTENCES, TURNED INTO A RECTANGLE:
 *
 * 1. "i asked for its own section, that means a title, an underline in gold and
 *    the stuff under it" is three titled sub-sections under a grid, two under a
 *    flex container, each a title with a rule and content under it.
 * 2. "stop putting container with border everywhere" / "why the black
 *    background?" means NOTHING in the section paints a sunken well or a card,
 *    asserted against the computed background of every box that used to.
 * 3. "in the first section, we should still have label for gaps and general
 *    stuff" (§56) means three labelled pieces, Type first, packed into as few rows
 *    as their measured widths allow instead of stacked one per line.
 * 4. "I WANT NO EMPTY SPACE" means the gap piece reaches the right-hand edge of the
 *    section at every rail, and no piece is on a line of its own that another
 *    would have fitted on.
 * 5. "the add column or row should be at the very end of the grid component"
 *    means the column `+` is right of the last column header and shares its row;
 *    the row `+` is below the last row header and shares its column.
 * 6. THE STRIP IS ONE ROW IN EVERY SELECTION STATE AT EVERY REACHABLE RAIL. §54
 *    could not say this: a track's own actions plus the 81px `[size ▾]` field
 *    wrapped to two rows at 232 and at the old 188. The size moved onto
 *    the track's own header, and the wrap §54.4 had to record as a deliberate
 *    deviation is gone.
 */
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { ONE_ROW, RAILS, measureRails } from './layout-bands.harness';
import type { Rig } from './layout-bands.harness';

let rig: Rig;
const NAMES = ['none', 'cell', 'column', 'row'];

beforeAll(async () => { rig = await measureRails(); }, 60_000);
afterAll(async () => { await rig?.close(); });

describe('three sections, flat on the panel, with nothing boxed', () => {
  it('titles them by CONCERN, and a flex container gets two extra', () => {
    // §58: "THE OPTIONS GO BY CONCERNS." Layout · Alignment · manipulation for
    // both, plus FLOW and a FLEX MANIPULATION section for a flex container. The
    // latter is what "same principle" asked for. FLOW is its own section precisely
    // because `direction` turns the alignment diagrams, which makes those tiles a
    // LATER section reacting instead of the pressed section rearranging.
    for (const rail of RAILS) {
      expect(`${rail} grid ${rig.at(rail, 'sectionGrid').titles.join(' · ')}`)
        .toBe(`${rail} grid Container · Alignment · Grid manipulation`);
      expect(`${rail} flex ${rig.at(rail, 'sectionFlex').titles.join(' · ')}`)
        .toBe(`${rail} flex Container · Flow · Alignment · Flex manipulation`);
    }
  });

  it('names the TYPE first, then the overlay, then the gap, and does so under BOTH', () => {
    // "we should still have label for gaps and general stuff", so each piece
    // carries its word, and since §58 it is the SAME three words under either
    // engine, because pressing Type may not change anything in Type's own
    // section but which button is lit.
    for (const rail of RAILS) {
      for (const kase of ['sectionGrid', 'sectionFlex']) {
        expect(`${rail} ${kase} ${rig.at(rail, kase).labels.join(' · ')}`)
          .toBe(`${rail} ${kase} Type · Overlay · Gap`);
      }
    }
  });

  it('packs the pieces into as few rows as their own widths allow', () => {
    // TETRIS, BY MEASUREMENT, and the proof is that the answer CHANGES with the
    // rail. Every piece is one row tall since §56 (the 82px alignment pad moved
    // to section two), so the only question left is how many share a line. And
    // "as many as fit" means two lines where three pieces do not fit and ONE
    // line where they do. A grammar-driven layout would give the same number at
    // both. Overlapping vertical ranges, not equal `top`s: the gap field is
    // 28px against the icon rows' 26 and is centred against them.
    const linesOf = (boxes: readonly { top: number; bottom: number }[]): number =>
      [...boxes].sort((a, b) => a.top - b.top).reduce((lines, box, i, all) =>
        (i > 0 && box.top < all[i - 1].bottom ? lines : lines + 1), 0);
    for (const rail of RAILS) {
      const pieces = rig.at(rail, 'sectionGrid').pieces;
      expect(`${rail} pieces ${pieces.length}`).toBe(`${rail} pieces 3`);
      expect(`${rail} type+overlay share a line ${pieces[0].top === pieces[1].top}`)
        .toBe(`${rail} type+overlay share a line true`);
      // 220 and 232 hold Type+Overlay and then Gap; 320 holds all three.
      expect(`${rail} lines ${linesOf(pieces)}`)
        .toBe(`${rail} lines ${rail === 320 ? 1 : 2}`);
    }
    // AND THE SAME ANSWER FOR A FLEX CONTAINER, piece for piece and line for
    // line, which is the geometric form of "nothing in this section changes
    // when Type is pressed".
    for (const rail of RAILS) {
      const flex = rig.at(rail, 'sectionFlex').pieces;
      expect(`${rail} flex pieces ${flex.length}`).toBe(`${rail} flex pieces 3`);
      expect(`${rail} flex lines ${linesOf(flex)}`)
        .toBe(`${rail} flex lines ${rail === 320 ? 1 : 2}`);
    }
  });

  it('leaves no dead space to the right of the gap piece, at any rail', () => {
    // The gap fields take the rest of their line, so the piece's right edge IS
    // the section's. Within 1px: a `1fr` track can land on a half pixel.
    for (const rail of RAILS) {
      const m = rig.at(rail, 'sectionGrid');
      const gapPiece = m.pieces[m.pieces.length - 1];
      const slack = Math.round(m.parts['hud-layout-set'].right - gapPiece.right);
      expect(`${rail} slack ${slack}`).toBe(`${rail} slack 0`);
    }
  });

  it('gives a grid two gap fields on one line, each wide enough to type in', () => {
    // §54's two gap cells were 44px each beside a pad that also carried a 30px
    // `stretch` column; at 232 that left them a sliver, and §55 bought them back
    // by stacking one per line. The pad is out of this section entirely now, so
    // both fit the SAME line and still clear 50px each. That is 54 at 320,
    // where the whole section is one line, and 98 at 220, where it is two.
    for (const rail of RAILS) {
      const gaps = rig.at(rail, 'sectionGrid').steps;
      expect(`${rail} gap fields ${gaps.length}`).toBe(`${rail} gap fields 2`);
      expect(`${rail} same line ${gaps[0].top === gaps[1].top}`)
        .toBe(`${rail} same line true`);
      const narrow = Math.min(...gaps.map((g) => g.right - g.left));
      expect(`${rail} narrowest gap >= 50: ${narrow >= 50}`)
        .toBe(`${rail} narrowest gap >= 50: true`);
    }
  });

  it('draws every alignment tile at one size, in full lines (§56)', () => {
    // The two faults rounds 10 and 12 were shot to find: the same control drawn
    // at two sizes stacked, and a six-option row wrapping until its own cap
    // floated in the middle of it. Both are geometry, so both live here.
    for (const kase of ['sectionGrid', 'sectionFlex']) {
      for (const rail of RAILS) {
        const tiles = rig.at(rail, kase).tiles;
        const widths = new Set(tiles.map((t) => Math.round(t.right - t.left)));
        expect(`${rail}/${kase} tile widths ${[...widths].join('/')}`)
          .toBe(`${rail}/${kase} tile widths ${[...widths][0]}`);
        // A grid's two axes are a line each. A flex container's six main-axis
        // values FOLD into two full lines of three (positions over
        // distributions) above the cross axis's one - see `layout-widths`.
        const rows = new Set(tiles.map((t) => t.top)).size;
        const want = kase === 'sectionFlex' ? 3 : 2;
        expect(`${rail}/${kase} tile lines ${rows}`).toBe(`${rail}/${kase} tile lines ${want}`);
      }
    }
    // Four values on each grid axis; six and three on a flex container's.
    expect(rig.at(232, 'sectionGrid').tiles.length).toBe(8);
    expect(rig.at(232, 'sectionFlex').tiles.length).toBe(9);
  });

  it('paints no well, no card and no border anywhere in its own chrome', () => {
    // "why do we have container inception exactly?? and why the black
    // background? [...] stop putting container with border everywhere, that's
    // horrible." §54 drew three nested surfaces here: the block's `--c-surface`
    // card, the settings panel's `--c-sunken` well, and the alignment pad's own
    // well inside that. The only thing that paints now is the sub-section rule,
    // which is a border on the TITLE, not on a box around anything.
    for (const rail of RAILS) {
      for (const kase of ['sectionGrid', 'sectionFlex']) {
        expect(`${rail}/${kase} painted ${rig.at(rail, kase).painted.join(',')}`)
          .toBe(`${rail}/${kase} painted `);
      }
    }
  });

  it('puts the `+` at the very END of each header strip', () => {
    // "the add column or row should be at the very end of the grid component
    // (next to the column selection last column on its right) and same for row
    // but on the bottom of that row selection last. just a + icon."
    for (const rail of RAILS) {
      const m = rig.at(rail, 'state-none');
      const colAdd = m.adds['columns'];
      const colHead = m.lastHeads['columns'];
      expect(`${rail} column + is right of the last header ${colAdd.left >= colHead.right}`)
        .toBe(`${rail} column + is right of the last header true`);
      expect(`${rail} column + shares its row ${colAdd.top === colHead.top}`)
        .toBe(`${rail} column + shares its row true`);
      const rowAdd = m.adds['rows'];
      const rowHead = m.lastHeads['rows'];
      expect(`${rail} row + is below the last header ${rowAdd.top >= rowHead.bottom}`)
        .toBe(`${rail} row + is below the last header true`);
      expect(`${rail} row + shares its column ${rowAdd.left === rowHead.left}`)
        .toBe(`${rail} row + shares its column true`);
    }
  });

  it('gives a flex container the SAME two gap fields and the same overlay', () => {
    // §56 gave it one gap cell and no overlay, and §57 proved both were false
    // about the MODEL: the flow engine always spent a gap on each axis and
    // `guide` is any container's. So pressing Type cannot grow a field or make
    // a piece appear any more, at any rail.
    for (const rail of RAILS) {
      const m = rig.at(rail, 'sectionFlex');
      const g = rig.at(rail, 'sectionGrid');
      expect(`${rail} flex gap fields ${m.steps.length}`).toBe(`${rail} flex gap fields 2`);
      expect(`${rail} same line ${m.steps[0].top === m.steps[1].top}`)
        .toBe(`${rail} same line true`);
      expect(`${rail} flex overlay ${m.parts['hud-layout-set__overlay'] !== undefined}`)
        .toBe(`${rail} flex overlay true`);
      // The pieces are not merely present, they are the same rectangles.
      expect(`${rail} same overlay box ${m.parts['hud-layout-set__overlay'].right - m.parts['hud-layout-set__overlay'].left}`)
        .toBe(`${rail} same overlay box ${g.parts['hud-layout-set__overlay'].right - g.parts['hud-layout-set__overlay'].left}`);
    }
  });
});

describe('the toolbar is ONE strip and ONE row, in every state and at every rail', () => {
  it('is exactly one row tall with nothing selected', () => {
    for (const rail of RAILS) {
      expect(`${rail} empty bar ${rig.at(rail, 'state-none').parts['hud-grid__bar'].h}`)
        .toBe(`${rail} empty bar ${ONE_ROW}`);
    }
  });

  it('stays one row for every selection kind, which §54 could not say', () => {
    // THE DEVIATION §54.4 HAD TO RECORD IS GONE. A track used to add an 81px
    // `[size ▾]` control to five buttons behind a `COLUMN 2` chip, for 287.4px
    // against a 224px strip at 232, so it wrapped. The size is on the track's own
    // header now, so nothing in this strip is a field.
    for (const rail of RAILS) {
      expect(`${rail} bars ${NAMES.map((n) => rig.at(rail, `state-${n}`).parts['hud-grid__bar'].h).join('/')}`)
        .toBe(`${rail} bars ${NAMES.map(() => ONE_ROW).join('/')}`);
    }
  });

  it('keeps the LATTICE at exactly the same y in every state', () => {
    const top = (rail: number, name: string): number =>
      rig.at(rail, `state-${name}`).parts['hud-lattice__scroll'].top;
    for (const rail of RAILS) {
      expect(`${rail} shifts ${NAMES.map((n) => top(rail, n) - top(rail, 'none')).join('/')}`)
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
