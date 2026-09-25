/* @layer tests @kind test */
/**
 * Phase 7 of `plans/hud-inspector-ux-review.html`. The Layout section's four
 * new controls, MEASURED, on the harness phases 1 and 3 built: SSR the real
 * components, load the real token/primitive/editor stylesheets into headless
 * Chromium, and read the boxes at 289 / 232 / 188 px (the default rail, the
 * width every wireframe on that page is drawn at, and the 220 px minimum).
 *
 * THE ONE TO PROVE IS `AlignmentTiles` AT 188 (§56). The 3x3 pad it replaces
 * was intrinsically sized at 82 px on every rail, so the only question it ever
 * raised was whether it FITS. A row of option tiles is elastic and asks a
 * harder one: a flex main axis offers six values against a cross axis's three,
 * so the tiles have to stay ONE SIZE across the component (or the same control
 * is drawn at two sizes, stacked, as in round 10) and the six have to stay on ONE
 * LINE (or the cap floats in the middle of the block it names, as in round 12).
 * Both are measured here, at every rail, for both engines and both flows.
 *
 * THE TRACK STRIP IS GONE (§48). `TrackListField`'s chip strips and its 44 px
 * miniature were replaced by ONE `GridEditor`, so what is measured in its place
 * is the lattice's own floor of 24 px per cell on BOTH axes, which is
 * the complaint that started §48 and the one thing a strip of chips above a
 * 12 px-per-row drawing could never satisfy. The lattice's full arithmetic is
 * `hud-grid-editor-metrics.keep.test.ts`; what stays here is the rest of the
 * Layout section beside it.
 */
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { chromium, type Browser } from 'playwright';
import { createElement as h } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { readFileSync, readdirSync } from 'fs';
import { join, resolve } from 'path';
import { AlignmentTiles } from '../../apps/web/src/ui/domains/app/views/HudLayoutEditor/sub-components/AlignmentTiles';
import { FLEX_ALIGN, FLEX_JUSTIFY, GRID_ITEMS } from '../../apps/web/src/ui/domains/app/views/HudLayoutEditor/behavior/align-options';
import { ColorField } from '../../apps/web/src/ui/domains/app/views/HudLayoutEditor/sub-components/ColorField';
import { DirectionControl } from '../../apps/web/src/ui/domains/app/views/HudLayoutEditor/sub-components/DirectionControl';
import { ExtentField } from '../../apps/web/src/ui/domains/app/views/HudLayoutEditor/sub-components/ExtentField';
import { IconButton } from '../../apps/web/src/ui/design-system/primitives/IconButton';
import { GridEditor } from '../../apps/web/src/ui/domains/app/views/HudLayoutEditor/sub-components/GridEditor';
import { PlatformContext } from '../../apps/web/src/platform/PlatformProvider';
import type { Platform } from '../../shared/platform';
import type { AlignRowSpec } from '../../apps/web/src/ui/domains/app/views/HudLayoutEditor/sub-components/AlignmentTiles';
import type { HudGridContainer } from '../../shared/types/hud';

const ROOT = resolve(__dirname, '../..');
const DS = `${ROOT}/apps/web/src/ui/design-system`;
const ED = `${ROOT}/apps/web/src/ui/domains/app/views/HudLayoutEditor/sub-components`;

const cssIn = (dir: string): string[] => readdirSync(dir, { withFileTypes: true })
  .flatMap((e) => (e.isDirectory() ? cssIn(join(dir, e.name)) : (e.name.endsWith('.css') ? [join(dir, e.name)] : [])));

// Walked, not listed, for the reason phase 4 recorded: this phase adds
// `HudLayoutEditor.layout.css` and an explicit list would silently measure four
// unstyled controls.
const SHEETS = [
  ...cssIn(`${DS}/tokens`).filter((f) => !f.endsWith('index.css')),
  ...cssIn(`${DS}/primitives`),
  ...cssIn(ED),
];

const noop = (): void => {};
const GUIDE = '#c064c0';
const PLATFORM = { info: { os: 'windows' } } as unknown as Platform;

const GRID: HudGridContainer = {
  kind: 'container', id: 'g', layout: 'grid',
  columns: ['auto', 'fill', { px: 16 }], rows: ['auto', 'auto'],
  guide: { show: true, color: GUIDE }, children: [],
};
/** The two shapes the component has to hold: four options on both axes, and
 *  six against three, which is the case that decides the track size. */
const GRID_ROWS: AlignRowSpec[] = [
  { key: 'justifyItems', cap: '↔', label: 'items across the cell', engine: 'grid', axis: 'main', options: GRID_ITEMS, value: 'stretch', onChange: noop },
  { key: 'alignItems', cap: '↕', label: 'items down the cell', engine: 'grid', axis: 'cross', options: GRID_ITEMS, value: 'stretch', onChange: noop },
];
const FLEX_ROWS: AlignRowSpec[] = [
  { key: 'justify', cap: 'main', label: 'along the main axis', engine: 'flex', axis: 'main', options: FLEX_JUSTIFY, value: 'start', onChange: noop },
  { key: 'align', cap: 'cross', label: 'across the cross axis', engine: 'flex', axis: 'cross', options: FLEX_ALIGN, value: 'start', onChange: noop },
];

const CASES: Record<string, () => unknown> = {
  alignGrid: () => h(AlignmentTiles, { direction: 'row', rows: GRID_ROWS }),
  alignFlexRow: () => h(AlignmentTiles, { direction: 'row', rows: FLEX_ROWS }),
  alignFlexColumn: () => h(AlignmentTiles, { direction: 'column', rows: FLEX_ROWS }),
  direction: () => h(DirectionControl, { value: 'row', onChange: noop }),
  tracks: () => h(PlatformContext.Provider, { value: PLATFORM }, h(GridEditor, {
    container: GRID, scope: {}, onPatchContainer: noop,
  })),
  // The extent field as the lattice's toolbar composes it once a header is
  // picked. Rebuilt here instead of driven, because SSR renders the initial
  // state and nothing in this harness can click: the shape is the assertion.
  trackEditor: () => h('div', { className: 'hud-grid__control' },
    h(ExtentField, { label: 'column 2', value: { px: 16 }, onChange: noop }),
    h('div', { className: 'hud-grid__bar' }, ...['◀', '▶', '+', '✕'].map((glyph, i) => h(
      IconButton, { key: i, variant: 'ghost', size: 'sm', label: glyph, onClick: noop }, glyph,
    )))),
  colour: () => h(ColorField, {
    label: 'guide', value: GUIDE, onChange: noop, hint: 'Editor only. Never drawn in game.',
  }),
};

const document_ = (rail: number): string => {
  const body = Object.entries(CASES)
    .map(([id, node]) => `<section data-case="${id}"><div class="hud-inspect__group">${
      renderToStaticMarkup(node() as never)}</div></section>`)
    .join('');
  const css = SHEETS.map((f) => readFileSync(f, 'utf8')).join('\n');
  return `<!doctype html><meta charset="utf-8"><style>
    html,body{margin:0;font-size:16px;font-family:system-ui}
    .rail{width:${rail}px}
    ${css}
  </style><div class="rail">${body}</div>`;
};

interface Measured {
  case: string; kind: string; name: string;
  width: number; height: number; content: number; lines: number; overflow: number; scroll: number;
}

const probe = (): Measured[] => {
  const px = (el: Element, side: string): number =>
    parseFloat((getComputedStyle(el) as unknown as Record<string, string>)[side]) || 0;
  const sel = [
    '.field__label', '.field__hint', '.hud-align', '.hud-align__row', '.hud-align__tiles',
    '.hud-align__diagram',
    '.hud-icon-choice', '.hud-grid', '.hud-grid__bar', '.hud-lattice__scroll', '.hud-lattice__cell',
    '.hud-color-field', '.text-input', '.color-swatch', '.icon-btn',
    '.hud-grid__control', '.hud-extent', '.number-input',
  ].join(', ');
  const out: Measured[] = [];
  for (const sec of Array.from(document.querySelectorAll('[data-case]'))) {
    const rail = sec.getBoundingClientRect();
    for (const el of Array.from(sec.querySelectorAll(sel))) {
      const box = el.getBoundingClientRect();
      const line = parseFloat(getComputedStyle(el).lineHeight) || box.height;
      out.push({
        case: (sec as HTMLElement).dataset.case ?? '?',
        kind: el.className.split(' ')[0],
        name: ((el as HTMLElement).innerText || el.getAttribute('aria-label') || '?').replace(/\s+/g, ' '),
        width: Math.round(box.width * 10) / 10,
        height: Math.round(box.height * 10) / 10,
        content: Math.round((box.width - px(el, 'paddingLeft') - px(el, 'paddingRight')
          - px(el, 'borderLeftWidth') - px(el, 'borderRightWidth')) * 10) / 10,
        lines: Math.max(1, Math.round(box.height / line)),
        overflow: Math.max(0, Math.round(box.right - rail.right)),
        scroll: Math.max(0, el.scrollWidth - el.clientWidth),
      });
    }
  }
  return out;
};

const measured: Record<number, Measured[]> = {};
const RAILS = [289, 232, 188];
let browser: Browser;

const at = (rail: number, kind: string, kase?: string): Measured[] =>
  (measured[rail] ?? []).filter((m) => m.kind === kind && (kase === undefined || m.case === kase));

beforeAll(async () => {
  browser = await chromium.launch();
  const page = await browser.newPage();
  for (const rail of RAILS) {
    await page.setContent(document_(rail));
    measured[rail] = await page.evaluate(probe);
  }
}, 60_000);

afterAll(async () => { await browser?.close(); });

describe('the alignment tiles, at the widths that broke the two rounds before', () => {
  const ALIGN_CASES = ['alignGrid', 'alignFlexRow', 'alignFlexColumn'];

  it('draws EVERY tile in a component at one size, at every rail (§56)', () => {
    // ROUND 10's fault, and the reason the track count is the widest row's
    // and not each row's own: a flex container's six main-axis tiles came
    // out at 30px beside three 48px cross-axis ones - the same control, drawn
    // at two sizes, one above the other.
    for (const rail of RAILS) {
      for (const kase of ALIGN_CASES) {
        const widths = new Set(at(rail, 'hud-align__diagram', kase).map((m) => m.width));
        expect(`${rail}/${kase} tile widths ${[...widths].join('/')}`)
          .toBe(`${rail}/${kase} tile widths ${[...widths][0]}`);
      }
    }
  });

  it('folds a six-option row into FULL lines of three - never a ragged wrap', () => {
    // TWO faults, one on each side of this. ROUND 12 let the row wrap freely
    // (`auto-fill`): six values took three ragged lines at the 232px rail with
    // `main` floating in the middle of the block it named. ROUND 17 answered by
    // holding all six to ONE line - and at 232 the tiles came out ~26px wide,
    // where `between`, `around` and `evenly` differ by about a pixel: three
    // identical tiles, which is the "confusing since it's small" the remake was
    // asked to fix. So a row longer than four FOLDS, at a fixed count: positions
    // (start, center, end) over distributions (between, around, evenly). Every
    // line is full at every rail, which is what separates a fold from a wrap.
    for (const rail of RAILS) {
      for (const kase of ALIGN_CASES) {
        const rows = at(rail, 'hud-align__tiles', kase);
        const tiles = at(rail, 'hud-align__diagram', kase);
        expect(`${rail}/${kase} rows ${rows.length}`).toBe(`${rail}/${kase} rows 2`);
        const perLine = new Map<number, number>();
        for (const t of tiles) perLine.set(Math.round(t.top), (perLine.get(Math.round(t.top)) ?? 0) + 1);
        const counts = new Set(perLine.values());
        expect(`${rail}/${kase} every line equally full ${counts.size === 1}`)
          .toBe(`${rail}/${kase} every line equally full true`);
      }
    }
  });

  it('stops growing at 72px instead of letterboxing the diagram', () => {
    for (const rail of RAILS) {
      for (const m of at(rail, 'hud-align__diagram')) {
        expect(`${rail}/${m.case} tile ${m.width <= 72}`).toBe(`${rail}/${m.case} tile true`);
      }
    }
  });
});

describe('every Layout row, at 289 / 232 / 188 px', () => {
  it('keeps each label and hint on one line, down to the 188 px minimum', () => {
    // The pad's label carries its own explanation (where children
    // land), which is the longest label in the section and the one this
    // measurement exists to keep honest.
    for (const rail of RAILS) {
      for (const m of [...at(rail, 'field__label'), ...at(rail, 'field__hint')]) {
        expect(`${rail}/${m.case}/${m.name} lines ${m.lines}`).toBe(`${rail}/${m.case}/${m.name} lines 1`);
      }
    }
  });

  it('never lets a Layout control escape the rail, down to 188 px', () => {
    for (const rail of RAILS) {
      for (const m of measured[rail] ?? []) {
        expect(`${rail}/${m.case}/${m.kind}/${m.name} overflow ${m.overflow}`)
          .toBe(`${rail}/${m.case}/${m.kind}/${m.name} overflow 0`);
      }
    }
  });

  it('gives a 3-column lattice cells over the 24 px floor at every rail', () => {
    // Six cells (3 x 2), and the claim is on BOTH axes: the drawing this
    // replaces was 57.3 x 12 at the 188 px rail, which fails SC 2.5.8 on the
    // short one whatever the width says. §50 made the cells PROPORTIONAL rather
    // than square; the floor is what survived, and it is the half that matters.
    for (const rail of RAILS) {
      const cells = at(rail, 'hud-lattice__cell', 'tracks');
      expect(`${rail} cells ${cells.length}`).toBe(`${rail} cells 6`);
      for (const c of cells) expect(`${rail} cell ${c.width >= 24}`).toBe(`${rail} cell true`);
    }
    // Three columns fit at every rail, so nothing scrolls yet. The overflow
    // case is `hud-grid-editor-metrics`, at twelve.
    for (const rail of RAILS) {
      for (const s of at(rail, 'hud-lattice__scroll', 'tracks')) expect(s.scroll).toBe(0);
    }
  });

  it('leaves the picked track typeable beside its four tools, down to 188 px', () => {
    // The `control` slot the lattice's toolbar puts an `ExtentField` in once a
    // header is selected. `ExtentField` is phase 5-6's, consumed unchanged, so
    // what is asserted about its insides is only that something remains
    // typeable; the toolbar's four icons are `icon-btn--sm` at 26 px.
    const tools = (measured[188] ?? []).filter((m) => m.case === 'trackEditor' && m.kind === 'icon-btn');
    expect(tools.length).toBe(4);
    for (const t of tools) expect(t.width).toBe(26);
    const typing = (measured[188] ?? [])
      .filter((m) => m.case === 'trackEditor' && /input/.test(m.kind));
    expect(typing.length).toBeGreaterThan(0);
    expect(Math.max(...typing.map((m) => m.content))).toBeGreaterThan(25);
  });

  it('draws the lattice at the full width of the rail it is in', () => {
    for (const rail of RAILS) {
      const lattice = at(rail, 'hud-lattice__scroll', 'tracks')[0];
      expect(`${rail} lattice ${lattice.width > rail - 40}`).toBe(`${rail} lattice true`);
    }
  });

  it('leaves ColorField room for a whole #rrggbb, down to 188 px', () => {
    // The fault this replaces: a raw hex box beside a swatch with no
    // `min-width: 0`, which is the same shape `.hud-paint-field__row` had when
    // phase 1 measured it at 13.9 px of typing surface.
    const hex = (rail: number): number => at(rail, 'text-input', 'colour')[0].content;
    expect([hex(289), hex(232), hex(188)]).toEqual([253, 196, 152]);
  });

  it('keeps the two direction icons on one row', () => {
    // 54 px is two 26 px buttons and one 2 px gap, the same figure at every
    // rail. It was 82 with three, until §42 gave `stack` back to the grid it
    // always was and the control went down to the one question it asks.
    for (const rail of RAILS) {
      const choice = at(rail, 'hud-icon-choice', 'direction')[0];
      expect(`${rail} direction ${choice.width}`).toBe(`${rail} direction 54`);
      expect(choice.lines).toBe(1);
    }
  });
});
