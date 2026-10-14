/* @layer tests @kind test */
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { chromium, type Browser } from 'playwright';
import { createElement as h } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { readFileSync } from 'fs';
import { GhostCard } from '@app/views/HudLayoutEditor/sub-components/DragGhost';
import { CellPicker } from '@app/views/HudLayoutEditor/sub-components/CellPicker';
import { PlatformContext } from '@drizztdourden08/brock-react';
import { ghostPosition } from '@app/hud-layout-editing/drop-ghost';
import { cssIn } from './files-in';
import { REPO_ROOT } from '../repo-root';
import { EDITOR_THEME_SHEETS } from './editor-theme-sheets.constants';
import { required } from '../required';
import { WINDOWS_PLATFORM } from './windows-platform';

const ROOT = REPO_ROOT;
const DS = `${ROOT}/node_modules/@drizztdourden08/tessera/src`;
const ED = `${ROOT}/apps/desktop/src/views/HudLayoutEditor/sub-components`;

const SHEETS = [
  ...cssIn(`${DS}/tokens`).filter((f) => !f.endsWith('index.css')),
  ...cssIn(`${DS}/theme`),
  `${ROOT}/apps/desktop/src/theme.css`,
  ...cssIn(`${DS}/primitives`),
  ...cssIn(`${DS}/composites`),
  ...EDITOR_THEME_SHEETS,
  ...cssIn(ED),
];

const GHOST = {
  tone: 'move' as const, chip: 'magic-bar', kind: 'into column', position: 'position 2 of 3', path: 'screen › hud', warn: false,
};

const VIEWPORT = { w: 900, h: 600 };
const CURSOR = { x: 300, y: 200 };
const CORNER = { x: 860, y: 560 };

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
  taken: () => h(PlatformContext.Provider, { value: WINDOWS_PLATFORM }, h(CellPicker, {
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
  const want = ['borderTopWidth', 'border-left-width', 'borderTopColor', 'backgroundImage', 'backgroundColor', 'boxShadow', 'borderStyle'];
  for (const sec of Array.from(document.querySelectorAll('[data-case]'))) {
    const name = (sec as HTMLElement).dataset.case ?? '?';
    for (const el of Array.from(sec.querySelectorAll('*'))) {
      const cls = (el.className || '').toString().split(' ').find((name) => name.startsWith('hud-'));
      if (!cls) continue;
      const marks = ['is-taken', 'is-down']
        .filter((mark) => el.classList.contains(mark)).map((mark) => `.${mark}`).join('');
      const state = (el as HTMLElement).dataset.state;
      const key = `${name}/${cls}${marks}${state ? `[${state}]` : ''}`;
      if (box[key]) continue;
      const r = el.getBoundingClientRect();
      box[key] = {
        x: Math.round(r.x * 10) / 10, y: Math.round(r.y * 10) / 10, w: Math.round(r.width * 10) / 10, h: Math.round(r.height * 10) / 10,
      };
      const computed = getComputedStyle(el);
      const caps = ['::before', '::after'].map((pseudo) => {
        const c = getComputedStyle(el, pseudo);
        return `${c.width}x${c.height}`;
      });
      style[key] = {
        ...Object.fromEntries(want.map((k) => [k, computed.getPropertyValue(k.replace(/[A-Z]/g, (c) => `-${c.toLowerCase()}`))])),
        caps: caps.join(' '),
      };
    }
  }
  return { box, style };
};

let read: Probe;
let browser: Browser | undefined;

beforeAll(async () => {
  const launched = await chromium.launch();
  browser = launched;
  const page = await launched.newPage({ viewport: { width: VIEWPORT.w, height: VIEWPORT.h } });
  await page.setContent(document_());
  read = await page.evaluate(probe);
}, 60_000);

afterAll(async () => { await browser?.close(); });

const boxOf = (key: string): Probe['box'][string] => required(read.box[key], `the box of ${key}`);

const styleOf = (key: string, property: string): string =>
  required(required(read.style[key], `the style of ${key}`)[property], `${property} of ${key}`);

describe('the §45 pan band is DRAWN, and only while a drag is live', () => {
  it('is a 24 px gradient at each end of the scroller, costing no layout', () => {
    expect(boxOf('pan/hud-outline__pan').h).toBe(0);
    expect(boxOf('pan/hud-outline__pan.is-down').h).toBe(0);
    expect(styleOf('pan/hud-outline__pan', 'caps').split(' ')[0]).toMatch(/x24px$/);
    expect(styleOf('pan/hud-outline__pan', 'backgroundImage')).toBe('none');
  });

  it('draws nothing at rest, because the scroller only wears it while `is-panning`', () => {
    expect(styleOf('quiet/hud-outline__pan', 'caps')).toBe('autoxauto autoxauto');
  });
});

describe('an occupied cell in the inspector is a DESTINATION, and is hatched', () => {
  it('hatches the cell a sibling already holds instead of filling or dimming it', () => {
    expect(styleOf('taken/hud-lattice__cell[occupied-selected]', 'backgroundImage'))
      .toContain('repeating-linear-gradient');
  });

  it('leaves an empty cell unhatched, so the two states are still told apart', () => {
    expect(styleOf('taken/hud-lattice__cell[empty]', 'backgroundImage')).toBe('none');
  });

  it('paints the node\'s OWN cell without the hatch, because where it IS comes first', () => {
    expect(styleOf('taken/hud-lattice__cell[selected]', 'backgroundImage')).toBe('none');
  });
});

describe('the ghost clears the cursor, and flips at the edge', () => {
  it('sits below-right by +14, +18', () => {
    const card = boxOf('ghost/hud-ghost');
    expect(card.x).toBe(CURSOR.x + 14);
    expect(card.y).toBe(CURSOR.y + 18);
  });

  it('flips to above-left near the viewport corner, without ever covering the cursor', () => {
    const card = boxOf('ghostflip/hud-ghost');
    expect(card.x + card.w).toBe(CORNER.x - 14);
    expect(card.y + card.h).toBe(CORNER.y - 18);
    expect(card.x + card.w).toBeLessThan(VIEWPORT.w);
    expect(card.y + card.h).toBeLessThan(VIEWPORT.h);
  });

  it('is one card of three lines, tall enough to read and narrow enough to follow', () => {
    const card = boxOf('ghost/hud-ghost');
    expect(card.h).toBeGreaterThan(30);
    expect(card.h).toBeLessThan(90);
    expect(card.w).toBeLessThan(320);
  });
});
