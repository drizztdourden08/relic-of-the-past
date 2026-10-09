/* @layer tests @kind test */
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { RAILS, measureRails } from '../layout-bands.harness';
import type { Rig } from '../layout-bands.harness';

let rig: Rig;

beforeAll(async () => { rig = await measureRails(); }, 60_000);
afterAll(async () => { await rig?.close(); });

describe('three sections, flat on the panel, with nothing boxed', () => {
  it('titles them by CONCERN, and a flex container gets two extra', () => {
    for (const rail of RAILS) {
      expect(`${rail} grid ${rig.at(rail, 'sectionGrid').titles.join(' · ')}`)
        .toBe(`${rail} grid Container · Alignment · Grid manipulation`);
      expect(`${rail} flex ${rig.at(rail, 'sectionFlex').titles.join(' · ')}`)
        .toBe(`${rail} flex Container · Flow · Alignment · Flex manipulation`);
    }
  });

  it('names the TYPE first, then the overlay, then the gap, and does so under BOTH', () => {
    for (const rail of RAILS) {
      for (const kase of ['sectionGrid', 'sectionFlex']) {
        expect(`${rail} ${kase} ${rig.at(rail, kase).labels.join(' · ')}`)
          .toBe(`${rail} ${kase} Type · Overlay · Gap`);
      }
    }
  });

  it('packs the pieces into as few rows as their own widths allow', () => {
    const linesOf = (boxes: readonly { top: number; bottom: number }[]): number =>
      [...boxes].sort((a, b) => a.top - b.top).reduce((lines, box, i, all) =>
        (i > 0 && box.top < all[i - 1].bottom ? lines : lines + 1), 0);
    for (const rail of RAILS) {
      const pieces = rig.at(rail, 'sectionGrid').pieces;
      expect(`${rail} pieces ${pieces.length}`).toBe(`${rail} pieces 3`);
      expect(`${rail} type+overlay share a line ${pieces[0].top === pieces[1].top}`)
        .toBe(`${rail} type+overlay share a line true`);
      expect(`${rail} lines ${linesOf(pieces)}`)
        .toBe(`${rail} lines ${rail === 320 ? 1 : 2}`);
    }
    for (const rail of RAILS) {
      const flex = rig.at(rail, 'sectionFlex').pieces;
      expect(`${rail} flex pieces ${flex.length}`).toBe(`${rail} flex pieces 3`);
      expect(`${rail} flex lines ${linesOf(flex)}`)
        .toBe(`${rail} flex lines ${rail === 320 ? 1 : 2}`);
    }
  });

  it('leaves no dead space to the right of the gap piece, at any rail', () => {
    for (const rail of RAILS) {
      const m = rig.at(rail, 'sectionGrid');
      const gapPiece = m.pieces[m.pieces.length - 1];
      const slack = Math.round(m.parts['hud-layout-set'].right - gapPiece.right);
      expect(`${rail} slack ${slack}`).toBe(`${rail} slack 0`);
    }
  });

  it('gives a grid two gap fields on one line, each wide enough to type in', () => {
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
    for (const kase of ['sectionGrid', 'sectionFlex']) {
      for (const rail of RAILS) {
        const tiles = rig.at(rail, kase).tiles;
        const widths = new Set(tiles.map((t) => Math.round(t.right - t.left)));
        expect(`${rail}/${kase} tile widths ${[...widths].join('/')}`)
          .toBe(`${rail}/${kase} tile widths ${[...widths][0]}`);
        const rows = new Set(tiles.map((t) => t.top)).size;
        const want = kase === 'sectionFlex' ? 3 : 2;
        expect(`${rail}/${kase} tile lines ${rows}`).toBe(`${rail}/${kase} tile lines ${want}`);
      }
    }
    expect(rig.at(232, 'sectionGrid').tiles.length).toBe(8);
    expect(rig.at(232, 'sectionFlex').tiles.length).toBe(9);
  });

  it('paints no well, no card and no border anywhere in its own chrome', () => {
    for (const rail of RAILS) {
      for (const kase of ['sectionGrid', 'sectionFlex']) {
        expect(`${rail}/${kase} painted ${rig.at(rail, kase).painted.join(',')}`)
          .toBe(`${rail}/${kase} painted `);
      }
    }
  });

  it('puts the `+` at the very END of each header strip', () => {
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
    for (const rail of RAILS) {
      const m = rig.at(rail, 'sectionFlex');
      const g = rig.at(rail, 'sectionGrid');
      expect(`${rail} flex gap fields ${m.steps.length}`).toBe(`${rail} flex gap fields 2`);
      expect(`${rail} same line ${m.steps[0].top === m.steps[1].top}`)
        .toBe(`${rail} same line true`);
      expect(`${rail} flex overlay ${m.parts['hud-layout-set__overlay'] !== undefined}`)
        .toBe(`${rail} flex overlay true`);
      expect(`${rail} same overlay box ${m.parts['hud-layout-set__overlay'].right - m.parts['hud-layout-set__overlay'].left}`)
        .toBe(`${rail} same overlay box ${g.parts['hud-layout-set__overlay'].right - g.parts['hud-layout-set__overlay'].left}`);
    }
  });
});
