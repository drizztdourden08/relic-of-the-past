/* @layer tests @kind test */
/**
 * §50's lattice, MEASURED, on the harness §34-§38 built: SSR the real component,
 * load the real token/primitive/editor stylesheets into headless Chromium, and
 * read the boxes at 188 / 232 / 320 px.
 *
 * THE CLAIM THIS FILE EXISTS FOR IS THE ONE THE MAINTAINER MADE: "cells should
 * match in size to the row and column. this doesn't look like a grid if they do
 * not." §48 drew every address as a uniform square. The screen's own
 * `[auto, fill, auto]` root is a narrow band, a wide one and a narrow one, and it
 * drew as three equal squares, a picture of a grid that does not exist. Here the cells
 * carry the engine's own solved proportions on BOTH axes, the middle band is
 * visibly the wide one, and the header strips sit exactly over and beside what
 * they label.
 *
 * AND THE 24px FLOOR SURVIVED THE CHANGE. Proportion never squashes a track past
 * WCAG 2.2 SC 2.5.8's target size; when the floors stop fitting, the lattice
 * SCROLLS with both header strips frozen instead of shrinking.
 *
 * THE ECHO IS `gridCellRects`' OWN ANSWER, to the pixel. An echo that is nearly
 * right is worse than none, because it would teach the wrong cell.
 */
import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest';
import { chromium, type Browser } from 'playwright';
import { createElement as h } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { readFileSync, readdirSync } from 'fs';
import { join, resolve } from 'path';
import { gridCellRects, solveGrid } from '../../shared/hud/engine/place-grid';
import { GridSolveContext } from '../../apps/web/src/ui/domains/app/views/HudLayoutEditor/behavior/grid-solve';
import { CellPicker } from '../../apps/web/src/ui/domains/app/views/HudLayoutEditor/sub-components/CellPicker';
import { GridEditor } from '../../apps/web/src/ui/domains/app/views/HudLayoutEditor/sub-components/GridEditor';
import { StageGridEcho, hull } from '../../apps/web/src/ui/domains/app/views/HudLayoutEditor/sub-components/StageGridEcho';
import { PlatformContext } from '../../apps/web/src/platform/PlatformProvider';
import type { GridSolve } from '../../apps/web/src/ui/domains/app/views/HudLayoutEditor/behavior/grid-solve';
import type { Platform } from '../../shared/platform';
import type { Extent, HudGridContainer, HudNode } from '../../shared/types/hud';
import type { MeasureContext } from '../../shared/hud/engine/engine.type';
import type { PlacedNode } from '../../shared/hud/engine';
import type { EditorSampleState } from '../../apps/web/src/ui/domains/app/views/HudLayoutEditor/behavior/useSampleState.type';

const ECHO = { containerId: 'echo-grid', c0: 2, c1: 3, r0: 1, r1: 1 };

// zustand serves `getInitialState` as the SERVER snapshot, so a `setState`
// before `renderToStaticMarkup` is not seen. The echo's own selection is stubbed
// on instead of worked around: what is under test is the RECTANGLE, and the
// selection that produced it is proved in `hud-grid-editor.keep.test.ts`.
vi.mock('@app/stores/hud-editor-view-store', () => ({
  useHudEditorViewStore: (select: (s: Record<string, unknown>) => unknown) =>
    select({ gridEcho: ECHO, setGridEcho: () => {} }),
}));

const ROOT_DIR = resolve(__dirname, '../..');
const DS = `${ROOT_DIR}/apps/web/src/ui/design-system`;
const ED = `${ROOT_DIR}/apps/web/src/ui/domains/app/views/HudLayoutEditor/sub-components`;

const cssIn = (dir: string): string[] => readdirSync(dir, { withFileTypes: true })
  .flatMap((e) => (e.isDirectory() ? cssIn(join(dir, e.name)) : (e.name.endsWith('.css') ? [join(dir, e.name)] : [])));

const SHEETS = [
  ...cssIn(`${DS}/tokens`).filter((f) => !f.endsWith('index.css')),
  ...cssIn(`${DS}/primitives`),
  ...cssIn(`${DS}/composites`),
  ...cssIn(ED),
];

const noop = (): void => {};
const PLATFORM = { info: { os: 'windows' } } as unknown as Platform;
const CTX: MeasureContext = { hearts: { max: 3, current: 3 }, filledSlots: [], scope: {} } as unknown as MeasureContext;
const VIEW = { x: 0, y: 0, w: 398, h: 224 };

const leaf = (id: string, place?: Record<string, number>): HudNode =>
  ({ id, kind: 'element', element: { type: 'spacer' }, size: { w: { px: 16 }, h: { px: 16 } }, ...(place ? { place } : {}) }) as unknown as HudNode;

const gridOf = (columns: Extent[], rows: Extent[], children: HudNode[], id = 'g'): HudGridContainer =>
  ({ kind: 'container', id, layout: 'grid', columns, rows, children });

const many = (count: number): Extent[] => Array.from({ length: count }, () => 'auto' as const);

/** The screen's own root, and the case that matters most because every HUD
 *  starts as one: a narrow band, a wide one, a narrow one, both ways. */
const THREE = gridOf(['auto', 'fill', 'auto'], ['auto', 'fill', 'auto'], [
  leaf('vitals', { column: 1, row: 1 }),
  leaf('wallet', { column: 1, row: 3 }),
]);
/** Twelve columns and ten rows: `12 * 24` of floor alone does not fit 320px, and
 *  must not try to. */
const TWELVE = gridOf(many(12), many(10), []);
/** All four states at once, on the ONE control that still has a selected state
 *  in a server render: (1,1) shared with a sibling, (2,1) the child's own alone,
 *  (2,2) a sibling's, (3,1) nothing. */
const STATES = gridOf(many(3), many(2), [
  leaf('under', { column: 1, row: 1 }),
  leaf('band', { column: 1, row: 1, colSpan: 2 }),
  leaf('other', { column: 2, row: 2 }),
]);

/** The real solve, for the real view the stage previews. The panel's lattice
 *  and the stage read the same numbers (`behavior/grid-solve-lookup.ts`). */
const solveOf = (container: HudGridContainer): GridSolve => {
  const { colSizes, rowSizes } = solveGrid(container, VIEW, 1, CTX);
  return { columns: colSizes, rows: rowSizes };
};

const withSolve = (container: HudGridContainer, node: unknown): unknown =>
  h(GridSolveContext.Provider, { value: () => solveOf(container) }, h(PlatformContext.Provider, { value: PLATFORM }, node as never));

const ECHO_GRID = gridOf([{ px: 20 }, { px: 20 }, { px: 20 }], [{ px: 10 }], [], 'echo-grid');
const ECHO_BOX = { x: 8, y: 6, w: 120, h: 40 };
const ECHO_SCALE = 2;
const PLACED: PlacedNode[] = [{
  id: 'echo-grid', node: ECHO_GRID, rect: ECHO_BOX, scale: 1, opacity: 1, dimmed: false,
}];
const SAMPLE = { hearts: CTX.hearts, filledSlots: [], dataScope: {} } as unknown as EditorSampleState;

const editor = (container: HudGridContainer): unknown =>
  withSolve(container, h(GridEditor, { container, scope: {}, onPatchContainer: noop }));

const CASES: Record<string, () => unknown> = {
  three: () => editor(THREE),
  twelve: () => editor(TWELVE),
  states: () => withSolve(STATES, h(CellPicker, {
    container: STATES, childId: 'band', place: { column: 1, row: 1, colSpan: 2 }, onChange: noop,
  })),
  echo: () => h('div', { className: 'echo-stage' },
    h(StageGridEcho, { placed: PLACED, scale: ECHO_SCALE, sample: SAMPLE })),
};

const document_ = (rail: number): string => {
  const body = Object.entries(CASES)
    .map(([id, node]) => `<section data-case="${id}"><div class="hud-section__body">${
      renderToStaticMarkup(node() as never)}</div></section>`)
    .join('');
  const css = SHEETS.map((f) => readFileSync(f, 'utf8')).join('\n');
  return `<!doctype html><meta charset="utf-8"><style>
    html,body{margin:0;font-size:16px;font-family:system-ui}
    .rail{width:${rail}px}
    /* The stage's own box: the coordinate space the echo's rect is in. */
    .echo-stage{position:relative;width:398px;height:224px}
    ${css}
  </style><div class="rail">${body}</div>`;
};

interface Cells { case: string; column: number; row: number; x: number; y: number; width: number; height: number }
interface Heads {
  case: string; axis: string; index: number; empty: boolean;
  x: number; y: number; width: number; height: number;
}
interface Scroller { case: string; scrollW: number; clientW: number; scrollH: number; clientH: number }
interface Frozen { rowHeadOffset: number; colHeadOffset: number; sticky: string }

interface Read {
  cells: Cells[];
  heads: Heads[];
  scroll: Scroller[];
  paint: Record<string, string>;
  frozen: { before: Frozen; after: Frozen };
  echo: { x: number; y: number; w: number; h: number } | null;
}

const probe = (): Read => {
  const round = (n: number): number => Math.round(n * 10) / 10;
  const cells: Cells[] = [];
  const heads: Heads[] = [];
  const scroll: Scroller[] = [];
  const paint: Record<string, string> = {};
  for (const sec of Array.from(document.querySelectorAll('[data-case]'))) {
    const name = (sec as HTMLElement).dataset.case ?? '?';
    for (const el of Array.from(sec.querySelectorAll('.hud-lattice__cell'))) {
      const box = el.getBoundingClientRect();
      const data = (el as HTMLElement).dataset;
      cells.push({
        case: name, column: Number(data.column), row: Number(data.row),
        x: round(box.x), y: round(box.y), width: round(box.width), height: round(box.height),
      });
      const state = data.state ?? '?';
      const css = getComputedStyle(el);
      // One string per state: a colour alone would call the hatch and its ground
      // the same paint.
      if (!paint[state]) paint[state] = `${css.backgroundColor} | ${css.backgroundImage}`;
    }
    for (const el of Array.from(sec.querySelectorAll('.hud-lattice__head'))) {
      const box = el.getBoundingClientRect();
      const label = el.getAttribute('aria-label') ?? '';
      heads.push({
        case: name, axis: label.startsWith('column') ? 'columns' : 'rows',
        index: Number(label.split(' ')[1]), empty: (el as HTMLElement).dataset.empty === 'true',
        x: round(box.x), y: round(box.y), width: round(box.width), height: round(box.height),
      });
    }
    for (const el of Array.from(sec.querySelectorAll('.hud-lattice__scroll'))) {
      scroll.push({
        case: name, scrollW: el.scrollWidth, clientW: el.clientWidth, scrollH: el.scrollHeight, clientH: el.clientHeight,
      });
    }
  }

  const port = document.querySelector('[data-case="twelve"] .hud-lattice__scroll');
  const frozenNow = (): Frozen => {
    const view = port?.getBoundingClientRect();
    const rowHead = port?.querySelector('.hud-lattice__head--row')?.getBoundingClientRect();
    const colHead = port?.querySelector('.hud-lattice__head:not(.hud-lattice__head--row)')?.getBoundingClientRect();
    const sticky = getComputedStyle(port?.querySelector('.hud-lattice__head--row') as Element).position;
    return {
      rowHeadOffset: round((rowHead?.left ?? 0) - (view?.left ?? 0)),
      colHeadOffset: round((colHead?.top ?? 0) - (view?.top ?? 0)),
      sticky,
    };
  };
  const before = frozenNow();
  if (port) { port.scrollLeft = 120; port.scrollTop = 60; }
  const after = frozenNow();

  const echoBox = document.querySelector('[data-case="echo"] .hud-grid-echo')?.getBoundingClientRect();
  const stage = document.querySelector('.echo-stage')?.getBoundingClientRect();
  const echo = echoBox && stage
    ? {
      x: round(echoBox.left - stage.left), y: round(echoBox.top - stage.top),
      w: round(echoBox.width), h: round(echoBox.height),
    }
    : null;
  return { cells, heads, scroll, paint, frozen: { before, after }, echo };
};

const RAILS = [188, 232, 320];
const read: Record<number, Read> = {};
let browser: Browser;

const cellsOf = (rail: number, kase: string): Cells[] => (read[rail]?.cells ?? []).filter((c) => c.case === kase);
const cellAt = (rail: number, kase: string, column: number, row: number): Cells =>
  cellsOf(rail, kase).find((c) => c.column === column && c.row === row) as Cells;

beforeAll(async () => {
  browser = await chromium.launch();
  const page = await browser.newPage();
  for (const rail of RAILS) {
    await page.setContent(document_(rail));
    read[rail] = await page.evaluate(probe);
  }
}, 60_000);

afterAll(async () => { await browser?.close(); });

describe('the cells match the real tracks, on both axes', () => {
  it('draws the screen root\'s middle band visibly wider AND taller than its edges', () => {
    // `[auto, fill, auto]` both ways, against a 398x224 view. The engine's own
    // answer teaches something: the third COLUMN has no child in it, so
    // that `auto` measures nothing and solves to 0, which is the empty-auto case §50
    // draws at the floor and MARKS. The rows each hold something, so all three
    // are real. §48's uniform squares said all six were the same size.
    const solved = solveOf(THREE);
    expect(solved.columns.map(Math.round)).toEqual([16, 382, 0]);
    expect(solved.rows.map(Math.round)).toEqual([16, 192, 16]);
    for (const rail of RAILS) {
      const mid = cellAt(rail, 'three', 2, 2);
      const edge = cellAt(rail, 'three', 1, 1);
      expect(`${rail} wider ${mid.width > edge.width * 2}`).toBe(`${rail} wider true`);
      expect(`${rail} taller ${mid.height > edge.height}`).toBe(`${rail} taller true`);
    }
  });

  it('draws an empty `auto` track at the floor and SAYS that is what it is', () => {
    // Drawing a 0px track at 24px without a word would be a lie about its size.
    // The header wears the note, so the floor is honest.
    for (const rail of RAILS) {
      const empty = cellAt(rail, 'three', 3, 1);
      expect(`${rail} floor ${empty.width}`).toBe(`${rail} floor 24`);
    }
    const marked = read[232].heads
      .filter((hd) => hd.case === 'three' && hd.axis === 'columns' && hd.index === 3);
    expect(marked.length).toBe(1);
    expect(marked[0].empty).toBe(true);
    // And the two tracks that DID measure something are not marked.
    expect(read[232].heads
      .filter((hd) => hd.case === 'three' && hd.axis === 'columns' && hd.index !== 3)
      .every((hd) => hd.empty === false)).toBe(true);
  });

  it('keeps every cell of a row the same height and every cell of a column the same width', () => {
    for (const rail of RAILS) {
      const cells = cellsOf(rail, 'three');
      expect(`${rail} cells ${cells.length}`).toBe(`${rail} cells 9`);
      for (const c of cells) {
        const sameColumn = cells.find((o) => o.column === c.column && o.row !== c.row) as Cells;
        const sameRow = cells.find((o) => o.row === c.row && o.column !== c.column) as Cells;
        expect(`${rail} w ${Math.abs(c.width - sameColumn.width) < 0.5}`).toBe(`${rail} w true`);
        expect(`${rail} h ${Math.abs(c.height - sameRow.height) < 0.5}`).toBe(`${rail} h true`);
      }
    }
  });

  it('puts every header exactly over, and beside, what it labels', () => {
    // "The column headers must sit exactly over their columns and the row
    // headers exactly beside their rows. That is what `looks like a grid`
    // means." One CSS grid holds both, so this is a property, not an
    // arithmetic agreement; asserting it is what stops the two drifting apart.
    for (const rail of RAILS) {
      for (const head of read[rail].heads.filter((hd) => hd.case === 'three')) {
        const owned = cellsOf(rail, 'three')
          .filter((c) => (head.axis === 'columns' ? c.column : c.row) === head.index);
        for (const c of owned) {
          if (head.axis === 'columns') {
            expect(`${rail} col${head.index} x ${head.x} ${c.x}`).toBe(`${rail} col${head.index} x ${c.x} ${c.x}`);
            expect(`${rail} col${head.index} w ${head.width}`).toBe(`${rail} col${head.index} w ${c.width}`);
          } else {
            expect(`${rail} row${head.index} y ${head.y} ${c.y}`).toBe(`${rail} row${head.index} y ${c.y} ${c.y}`);
            expect(`${rail} row${head.index} h ${head.height}`).toBe(`${rail} row${head.index} h ${c.height}`);
          }
        }
      }
    }
  });

  it('never squashes a track below the 24 px target, at 188 / 232 / 320', () => {
    // The floor §48 won and §50 kept: proportion is allowed to make a cell
    // bigger and never allowed to make one unhittable (WCAG 2.2 SC 2.5.8).
    for (const rail of RAILS) {
      for (const kase of ['three', 'twelve', 'states']) {
        for (const c of cellsOf(rail, kase)) {
          expect(`${rail}/${kase} ${c.width >= 24 && c.height >= 24}`).toBe(`${rail}/${kase} true`);
        }
      }
    }
  });
});

describe('past the fit it scrolls, and the header strips do not go with it', () => {
  it('overflows a twelve-column grid instead of shrinking its cells', () => {
    for (const rail of RAILS) {
      const port = (read[rail]?.scroll ?? []).find((s) => s.case === 'twelve');
      expect(`${rail} scrolls ${(port?.scrollW ?? 0) > (port?.clientW ?? 0)}`).toBe(`${rail} scrolls true`);
      for (const c of cellsOf(rail, 'twelve')) expect(c.width).toBeGreaterThanOrEqual(24);
    }
  });

  it('caps its own height and scrolls there too instead of pushing the legend away', () => {
    for (const rail of RAILS) {
      const port = (read[rail]?.scroll ?? []).find((s) => s.case === 'twelve');
      expect(`${rail} height ${(port?.clientH ?? 0) <= 220}`).toBe(`${rail} height true`);
      expect(`${rail} tall ${(port?.scrollH ?? 0) > (port?.clientH ?? 0)}`).toBe(`${rail} tall true`);
    }
  });

  it('keeps both strips pinned to the viewport while the body moves under them', () => {
    // Frozen panes, the mechanism every spreadsheet uses, and it earns its place
    // here for a reason beyond familiarity: the strips are the only thing that
    // identifies a cell, so they are exactly what must not scroll away.
    for (const rail of RAILS) {
      const { before, after } = read[rail].frozen;
      expect(`${rail} ${after.sticky}`).toBe(`${rail} sticky`);
      // 120px of scroll travel, and the strips move by at most the lattice's own
      // 2px padding, because the sticky offset is the scrollport edge, not the grid's.
      expect(`${rail} row ${Math.abs(after.rowHeadOffset - before.rowHeadOffset) <= 3}`).toBe(`${rail} row true`);
      expect(`${rail} col ${Math.abs(after.colHeadOffset - before.colHeadOffset) <= 3}`).toBe(`${rail} col true`);
    }
  });
});

describe('the four cell states are four different paints', () => {
  it('tells empty, occupied, selected and selected-on-occupied apart by computed style', () => {
    const paint = read[232].paint;
    expect(Object.keys(paint).sort()).toEqual(['empty', 'occupied', 'occupied-selected', 'selected']);
    expect(new Set(Object.values(paint)).size).toBe(4);
    // And the crossed one is the HATCH §45.7 introduced, not a new drawing of
    // the same fact: landing on a sibling is a destination (§42.3).
    expect(paint['occupied-selected']).toContain('repeating-linear-gradient');
    expect(paint.empty).toContain('none');
    expect(paint.occupied).toContain('none');
    expect(paint.selected).toContain('none');
  });
});

describe('the stage echo is `gridCellRects`\' own answer, to the pixel', () => {
  it('washes exactly the rectangle the solve gives for the selected cells', () => {
    // Solved the ENGINE's way (game px, the host's own unit of 1) and only THEN
    // scaled for display. This used to pass ECHO_SCALE as the unit - the same
    // mistake the echo made, so the test agreed with a wrong answer (§52).
    const solved = gridCellRects(ECHO_GRID, ECHO_BOX, 1, CTX)
      .filter((c) => c.column >= ECHO.c0 && c.column <= ECHO.c1 && c.row >= ECHO.r0 && c.row <= ECHO.r1);
    expect(solved.length).toBe(2);
    const g = hull(solved.map((c) => c.rect));
    const want = { x: g.x * ECHO_SCALE, y: g.y * ECHO_SCALE, w: g.w * ECHO_SCALE, h: g.h * ECHO_SCALE };
    for (const rail of RAILS) {
      const got = read[rail].echo;
      expect(`${rail} echo ${got?.x},${got?.y} ${got?.w}x${got?.h}`)
        .toBe(`${rail} echo ${want.x},${want.y} ${want.w}x${want.h}`);
    }
  });

  it('never takes the pointer, because the surface it replaces was clickable and §46 took that away', () => {
    const sheet = readFileSync(`${ED}/GridEditor/HudLayoutEditor.grid.css`, 'utf8');
    expect(sheet).toMatch(/\.hud-grid-echo\s*\{[^}]*pointer-events:\s*none/);
  });
});
