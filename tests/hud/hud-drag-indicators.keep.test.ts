/* @layer tests @kind test */
/**
 * THE DRAG'S OWN MARKS, MEASURED on the harness §34/§35/§36 built: SSR the
 * real components, load the real token, primitive and editor stylesheets into
 * headless Chromium, and read the boxes.
 *
 * §46 TOOK MOST OF THIS FILE WITH IT. §44's stage drop surface was the most
 * visual thing in the whole plan and every mark it drew was measured here: the
 * 2 px insertion line and its caps, the grid cell wash, the co-place hatch and
 * its displaced occupant, and the band ring's per-axis border. None of those
 * exist any more, so none of them are asserted any more.
 *
 * What is left is what the outline still draws and still owns: the pan band at
 * each end of its scroller, the ghost's offset from the cursor and its corner
 * flip, and the inspector's own occupied-cell hatch, which used to be checked
 * against the stage's and is now checked on its own terms, because there is no
 * second mark left to agree with.
 */
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { chromium, type Browser } from 'playwright';
import { createElement as h } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { readFileSync, readdirSync } from 'fs';
import { join, resolve } from 'path';
import { GhostCard } from '../../apps/web/src/ui/domains/app/views/HudLayoutEditor/sub-components/DragGhost';
import { CellPicker } from '../../apps/web/src/ui/domains/app/views/HudLayoutEditor/sub-components/CellPicker';
import { PlatformContext } from '../../apps/web/src/platform/PlatformProvider';
import { ghostPosition } from '../../apps/web/src/ui/domains/app/views/HudLayoutEditor/behavior/drop-ghost';
import type { Platform } from '../../shared/platform';

const ROOT = resolve(__dirname, '../..');
const DS = `${ROOT}/apps/web/src/ui/design-system`;
const ED = `${ROOT}/apps/web/src/ui/domains/app/views/HudLayoutEditor/sub-components`;

const cssIn = (dir: string): string[] => readdirSync(dir, { withFileTypes: true })
  .flatMap((e) => (e.isDirectory() ? cssIn(join(dir, e.name)) : (e.name.endsWith('.css') ? [join(dir, e.name)] : [])));

// Walked, not listed. §36.9 recorded why: an explicit list
// silently measures an unstyled control the day a sheet moves.
const SHEETS = [
  ...cssIn(`${DS}/tokens`).filter((f) => !f.endsWith('index.css')),
  ...cssIn(`${DS}/primitives`),
  ...cssIn(`${DS}/composites`),
  ...cssIn(ED),
];

const GHOST = {
  tone: 'move' as const, chip: 'magic-bar', kind: 'into column', position: 'position 2 of 3', path: 'screen › hud', warn: false,
};

/** The cursor the ghost is measured against, and a viewport that puts it well
 *  inside on one axis and hard against the edge on the other. */
const VIEWPORT = { w: 900, h: 600 };
const CURSOR = { x: 300, y: 200 };
const CORNER = { x: 860, y: 560 };

const PLATFORM = { info: { os: 'windows' } } as unknown as Platform;

/** The inspector's own grid, with one cell already taken: a sibling-occupied
 *  cell is a DESTINATION and says so by wearing a hatch, and an empty one does
 *  not. §45 checked that hatch against the stage's co-place indicator; §46
 *  removed the stage's, §48 moved the drawing into the lattice, and §50 moved it
 *  once more into `CellPicker`, which is the only control left that places a
 *  child at all. It is the `occupied-selected` state now, still the same gradient. */
const GRID_PARENT = {
  id: 'badge',
  kind: 'container',
  layout: 'grid',
  columns: ['auto', 'auto'],
  rows: ['auto', 'auto'],
  children: [
    { id: 'life_pip', kind: 'element', element: { type: 'spacer' }, place: { column: 1, row: 1 } },
    // Spanning both columns of row 1: cell (1,1) is shared with `life_pip` and
    // wears the hatch, cell (2,1) is the child's own and alone and does not.
    { id: 'shield', kind: 'element', element: { type: 'spacer' }, place: { column: 1, row: 1, colSpan: 2 } },
  ],
} as never;

const CASES: Record<string, () => unknown> = {
  pan: () => h('div', { className: 'hud-outline__rows is-panning' }, [
    h('div', { key: 'up', className: 'hud-outline__pan is-up' }),
    h('div', { key: 'row', className: 'hud-outline__row' }, 'a row'),
    h('div', { key: 'down', className: 'hud-outline__pan is-down' }),
  ]),
  quiet: () => h('div', { className: 'hud-outline__rows' }, h('div', { className: 'hud-outline__pan is-up' })),
  taken: () => h(PlatformContext.Provider, { value: PLATFORM }, h(CellPicker, {
    container: GRID_PARENT, childId: 'shield',
    place: { column: 1, row: 1, colSpan: 2 }, onChange: () => {},
  })),
  ghost: () => h(GhostCard, { model: GHOST, style: ghostPosition(CURSOR, VIEWPORT) }),
  ghostflip: () => h(GhostCard, { model: GHOST, style: ghostPosition(CORNER, VIEWPORT) }),
};

const document_ = (): string => {
  const body = Object.entries(CASES)
    .map(([id, node]) => `<section data-case="${id}" class="stage">${renderToStaticMarkup(node() as never)}</section>`)
    .join('');
  const css = SHEETS.map((f) => readFileSync(f, 'utf8')).join('\n');
  return `<!doctype html><meta charset="utf-8"><style>
    html,body{margin:0;font-size:16px;font-family:system-ui;background:#000}
    /* The stage's own box: the coordinate space every rect above is in. */
    .stage{position:relative;width:240px;height:160px;margin:0 0 40px}
    [data-case="ghost"],[data-case="ghostflip"]{width:0;height:0;margin:0}
    ${css}
  </style>${body}`;
};

interface Probe {
  box: Record<string, { x: number; y: number; w: number; h: number }>;
  style: Record<string, Record<string, string>>;
}

const probe = (): Probe => {
  const box: Probe['box'] = {};
  const style: Probe['style'] = {};
  const want = ['borderTopWidth', 'borderLeftWidth', 'borderTopColor', 'backgroundImage', 'backgroundColor', 'boxShadow', 'borderStyle'];
  for (const sec of Array.from(document.querySelectorAll('[data-case]'))) {
    const name = (sec as HTMLElement).dataset.case ?? '?';
    for (const el of Array.from(sec.querySelectorAll('*'))) {
      // The first `hud-` class ANYWHERE in the list, not the first class: a
      // design-system `Button` puts its own variant classes in front of the
      // caller's, and the panel's cells are Buttons.
      const cls = (el.className || '').toString().split(' ').find((name) => name.startsWith('hud-'));
      if (!cls) continue;
      const marks = ['is-taken', 'is-down']
        .filter((mark) => el.classList.contains(mark)).map((mark) => `.${mark}`).join('');
      // §48's lattice says which of the four states a cell is in on a
      // `data-state` instead of in its class list, so the key has to carry it
      // or every cell would collapse onto one entry.
      const state = (el as HTMLElement).dataset?.state;
      const key = `${name}/${cls}${marks}${state ? `[${state}]` : ''}`;
      if (box[key]) continue;
      const r = el.getBoundingClientRect();
      box[key] = {
        x: Math.round(r.x * 10) / 10, y: Math.round(r.y * 10) / 10, w: Math.round(r.width * 10) / 10, h: Math.round(r.height * 10) / 10,
      };
      const computed = getComputedStyle(el) as unknown as Record<string, string>;
      style[key] = Object.fromEntries(want.map((k) => [k, computed[k]]));
      const caps = ['::before', '::after'].map((pseudo) => {
        const c = getComputedStyle(el, pseudo);
        return `${c.width}x${c.height}`;
      });
      style[key].caps = caps.join(' ');
    }
  }
  return { box, style };
};

let read: Probe;
let browser: Browser;

beforeAll(async () => {
  browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: VIEWPORT.w, height: VIEWPORT.h } });
  await page.setContent(document_());
  read = await page.evaluate(probe);
}, 60_000);

afterAll(async () => { await browser?.close(); });

describe('the §45 pan band is DRAWN, and only while a drag is live', () => {
  it('is a 24 px gradient at each end of the scroller, costing no layout', () => {
    // The band is a zero-height sticky child and a pseudo-element, so it sits at
    // the scroller's own edges without pushing a row anywhere. Undrawn
    // auto-scroll is the version everyone has met and nobody has understood.
    expect(read.box['pan/hud-outline__pan'].h).toBe(0);
    expect(read.box['pan/hud-outline__pan.is-down'].h).toBe(0);
    expect(read.style['pan/hud-outline__pan'].caps.split(' ')[0]).toMatch(/x24px$/);
    expect(read.style['pan/hud-outline__pan'].backgroundImage).toBe('none');
  });

  it('draws nothing at rest, because the scroller only wears it while `is-panning`', () => {
    expect(read.style['quiet/hud-outline__pan'].caps).toBe('autoxauto autoxauto');
  });
});

describe('an occupied cell in the inspector is a DESTINATION, and is hatched', () => {
  it('hatches the cell a sibling already holds instead of filling or dimming it', () => {
    // §45's rule, kept whole: landing on it stacks the two, so it must not read
    // as a rejection. §46 removed the stage's co-place indicator this used to be
    // string-compared against, so this is now the only place the mark lives.
    expect(read.style['taken/hud-lattice__cell[occupied-selected]'].backgroundImage)
      .toContain('repeating-linear-gradient');
  });

  it('leaves an empty cell unhatched, so the two states are still told apart', () => {
    expect(read.style['taken/hud-lattice__cell[empty]'].backgroundImage).toBe('none');
  });

  it('paints the node\'s OWN cell without the hatch, because where it IS comes first', () => {
    expect(read.style['taken/hud-lattice__cell[selected]'].backgroundImage).toBe('none');
  });
});

describe('the ghost clears the cursor, and flips at the edge', () => {
  it('sits below-right by +14, +18', () => {
    const card = read.box['ghost/hud-ghost'];
    expect(card.x).toBe(CURSOR.x + 14);
    expect(card.y).toBe(CURSOR.y + 18);
  });

  it('flips to above-left near the viewport corner, without ever covering the cursor', () => {
    const card = read.box['ghostflip/hud-ghost'];
    expect(card.x + card.w).toBe(CORNER.x - 14);
    expect(card.y + card.h).toBe(CORNER.y - 18);
    // And the flip is what keeps it on screen at all.
    expect(card.x + card.w).toBeLessThan(VIEWPORT.w);
    expect(card.y + card.h).toBeLessThan(VIEWPORT.h);
  });

  it('is one card of three lines, tall enough to read and narrow enough to follow', () => {
    const card = read.box['ghost/hud-ghost'];
    expect(card.h).toBeGreaterThan(30);
    expect(card.h).toBeLessThan(90);
    expect(card.w).toBeLessThan(320);
  });
});
