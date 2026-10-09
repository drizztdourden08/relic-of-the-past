/* @layer tests @kind test */
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

const SHEETS = [
  ...cssIn(`${DS}/tokens`).filter((f) => !f.endsWith('index.css')),
  ...cssIn(`${DS}/primitives`),
  ...cssIn(`${DS}/composites`),
  ...cssIn(ED),
];

const GHOST = {
  tone: 'move' as const, chip: 'magic-bar', kind: 'into column', position: 'position 2 of 3', path: 'screen › hud', warn: false,
};

const VIEWPORT = { w: 900, h: 600 };
const CURSOR = { x: 300, y: 200 };
const CORNER = { x: 860, y: 560 };

const PLATFORM = { info: { os: 'windows' } } as unknown as Platform;

const GRID_PARENT = {
  id: 'badge',
  kind: 'container',
  layout: 'grid',
  columns: ['auto', 'auto'],
  rows: ['auto', 'auto'],
  children: [
    { id: 'life_pip', kind: 'element', element: { type: 'spacer' }, place: { column: 1, row: 1 } },
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
      const cls = (el.className || '').toString().split(' ').find((name) => name.startsWith('hud-'));
      if (!cls) continue;
      const marks = ['is-taken', 'is-down']
        .filter((mark) => el.classList.contains(mark)).map((mark) => `.${mark}`).join('');
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
