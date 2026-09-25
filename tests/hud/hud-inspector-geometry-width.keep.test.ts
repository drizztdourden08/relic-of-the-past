/* @layer tests @kind test */
/**
 * Phases 5 and 6 of `plans/hud-inspector-ux-review.html`, MEASURED on the
 * harness phases 1, 3 and 4 built: SSR the real components, load the real
 * token, primitive and editor stylesheets into headless Chromium, and read the
 * boxes at 289 / 232 / 188 px (the default rail, the width every wireframe on
 * that page is drawn at, and the 220 px minimum).
 *
 * THE ONE TO PROVE IS THE BOX MODEL AT 188. §35.6 measured the four margin
 * edges as four `NumberInput`s in one row at **3.0 px of typing surface each**
 * and concluded that "no arrangement of four spinners fits 188 px", naming
 * `BoxModelField` as the answer. This is the file that checks the answer is one:
 * the same four edges, nested instead of in a row and drawn without a spinner
 * column, and the claim is that each is wide enough to hold the two digits and a
 * minus sign a margin actually carries.
 *
 * The other three controls are checked for the property that killed their
 * predecessors: nothing may escape the rail at any width, and no label may wrap.
 */
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { chromium, type Browser } from 'playwright';
import { createElement as h } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { readFileSync, readdirSync } from 'fs';
import { join, resolve } from 'path';
import { BoxModelField } from '../../apps/web/src/ui/domains/app/views/HudLayoutEditor/sub-components/BoxModelField';
import { ExtentField } from '../../apps/web/src/ui/domains/app/views/HudLayoutEditor/sub-components/ExtentField';
import { GridEditor } from '../../apps/web/src/ui/domains/app/views/HudLayoutEditor/sub-components/GridEditor';
import { MinMaxField } from '../../apps/web/src/ui/domains/app/views/HudLayoutEditor/sub-components/MinMaxField';
import { OffsetField } from '../../apps/web/src/ui/domains/app/views/HudLayoutEditor/sub-components/OffsetField';
import { SizeBoxSection } from '../../apps/web/src/ui/domains/app/views/HudLayoutEditor/sub-components/sections/SizeBoxSection';
import { PlatformContext } from '../../apps/web/src/platform/PlatformProvider';
import type { Platform } from '../../shared/platform';
import type { HudGridContainer, HudNode } from '../../shared/types/hud';

const ROOT = resolve(__dirname, '../..');
const DS = `${ROOT}/apps/web/src/ui/design-system`;
const ED = `${ROOT}/apps/web/src/ui/domains/app/views/HudLayoutEditor/sub-components`;

const cssIn = (dir: string): string[] => readdirSync(dir, { withFileTypes: true })
  .flatMap((e) => (e.isDirectory() ? cssIn(join(dir, e.name)) : (e.name.endsWith('.css') ? [join(dir, e.name)] : [])));

// Walked, not listed, for the lesson §36.9 recorded: an explicit list
// silently measures an unstyled control the day a sheet moves.
const SHEETS = [
  ...cssIn(`${DS}/tokens`).filter((f) => !f.endsWith('index.css')),
  ...cssIn(`${DS}/primitives`),
  ...cssIn(`${DS}/composites`),
  ...cssIn(ED),
];

const noop = (): void => {};
const scope = { life_current: 8 };

const PLATFORM = { info: { os: 'windows' } } as unknown as Platform;

const GRID_PARENT = {
  id: 'g', kind: 'container', layout: 'grid',
  columns: ['auto', 'auto', 'auto'], rows: ['auto', 'auto'],
  children: [{ id: 'pip', kind: 'element', element: { type: 'spacer' }, place: { column: 2, row: 1, colSpan: 2 } }],
} as unknown as HudGridContainer;

const CASES: Record<string, () => unknown> = {
  // The replacement for §35.6's `margin edge (each of four)` row.
  box: () => h(BoxModelField, {
    margin: { top: 0, right: 0, bottom: 0, left: -12 },
    padding: { top: 2, right: 2, bottom: 2, left: 2 },
    centre: '80 × 24',
    onMargin: noop,
    onPadding: noop,
  }),
  offset: () => h(OffsetField, { value: { left: -12 }, onChange: noop }),
  size: () => h('div', { className: 'hud-inspect__row' },
    h(ExtentField, { label: 'w', value: { px: 80 }, onChange: noop }),
    h(ExtentField, { label: 'h', value: undefined, onChange: noop })),
  limits: () => h(MinMaxField, { min: { w: 8 }, max: undefined, onMin: noop, onMax: noop, scope }),
  // The whole section, for the height claim the plan makes about it.
  sizebox: () => h(SizeBoxSection, {
    node: {
      id: 'n', kind: 'element', element: { type: 'spacer' },
      size: { w: { px: 80 } }, margin: { left: -12 },
      padding: { top: 2, right: 2, bottom: 2, left: 2 },
    } as unknown as HudNode,
    onPatch: noop,
    scope,
  }),
  cell: () => h(PlatformContext.Provider, { value: PLATFORM }, h(GridEditor, {
    container: GRID_PARENT, scope: {}, onPatchContainer: noop,
  })),
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
    ${css}
  </style><div class="rail">${body}</div>`;
};

interface Measured {
  case: string; kind: string; name: string;
  width: number; height: number; content: number; lines: number; overflow: number;
}

/** Section heights, for the one claim that is about vertical space. */
const heightProbe = (): Record<string, number> => {
  const out: Record<string, number> = {};
  for (const sec of Array.from(document.querySelectorAll('[data-case]'))) {
    out[(sec as HTMLElement).dataset.case ?? '?'] = Math.round(sec.getBoundingClientRect().height);
  }
  return out;
};

const probe = (): Measured[] => {
  const px = (el: Element, side: string): number =>
    parseFloat((getComputedStyle(el) as unknown as Record<string, string>)[side]) || 0;
  const out: Measured[] = [];
  for (const sec of Array.from(document.querySelectorAll('[data-case]'))) {
    const rail = sec.getBoundingClientRect();
    const sel = '.field__label, .number-input, .number-input__field, .text-input, .hud-lattice__cell';
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
      });
    }
  }
  return out;
};

const measured: Record<number, Measured[]> = {};
const heights: Record<number, Record<string, number>> = {};
const RAILS = [289, 232, 188];
let browser: Browser;

const named = (rail: number, name: string): Measured => {
  const hit = measured[rail]?.find((m) => m.name === name);
  if (!hit) throw new Error(`no "${name}" measured at ${rail}px`);
  return hit;
};

beforeAll(async () => {
  browser = await chromium.launch();
  const page = await browser.newPage();
  for (const rail of RAILS) {
    await page.setContent(document_(rail));
    measured[rail] = await page.evaluate(probe);
    heights[rail] = await page.evaluate(heightProbe);
  }
}, 60_000);

afterAll(async () => { await browser?.close(); });

describe('the box model answers the four-spinner row it replaces', () => {
  it('gives every margin edge a typing surface at the 188 px minimum', () => {
    // §35.6: "four numeric columns in 180 px leave 3 px of typing surface each.
    // No arrangement of four spinners fits 188 px. That is BoxModelField."
    // Nested rings plus no spinner column is the arrangement that does.
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
    // The nesting is the whole widget: a padding edge that measured wider than
    // its margin edge would mean the rings had collapsed into one row.
    for (const rail of RAILS) {
      expect(named(rail, 'padding left').width).toBeLessThanOrEqual(named(rail, 'margin left').width);
    }
  });
});

describe('the section is half the height it was', () => {
  it('draws the whole of Size & box in under 450 px, at every rail', () => {
    // The plan's claim: "the section drops from roughly 850 px to about 300",
    // softened in its own phase list to "about half". The ~850 px screenshot
    // was of a node with a size, a margin and four paddings. Measured with that
    // node it is 398 px, and the number does not move with
    // the rail because nothing in it wraps.
    for (const rail of RAILS) {
      expect(`${rail}px: ${heights[rail].sizebox < 450}`).toBe(`${rail}px: true`);
    }
    expect(heights[289].sizebox).toBe(heights[188].sizebox);
  });
});

describe('the new geometry controls, at 289 / 232 / 188 px', () => {
  it('never lets a control escape the rail, down to the minimum', () => {
    for (const rail of RAILS) {
      for (const m of measured[rail] ?? []) {
        expect(`${rail}/${m.case}/${m.kind}/${m.name} overflow ${m.overflow}`)
          .toBe(`${rail}/${m.case}/${m.kind}/${m.name} overflow 0`);
      }
    }
  });

  it('keeps every Field label on one line', () => {
    for (const rail of RAILS) {
      for (const m of (measured[rail] ?? []).filter((x) => x.kind === 'field__label')) {
        expect(`${rail}/${m.case}/${m.name} lines ${m.lines}`).toBe(`${rail}/${m.case}/${m.name} lines 1`);
      }
    }
  });

  it('leaves the offset pair typeable at the minimum rail', () => {
    // Two half-width numbers inside `PositionInput`'s shell at `sm`. The pair
    // is the section's top row, so it is the one that must not fold.
    const fields = (measured[188] ?? []).filter((m) => m.case === 'offset' && m.kind === 'number-input__field');
    expect(fields.length).toBe(2);
    for (const f of fields) expect(f.content).toBeGreaterThan(35);
  });

  it('leaves both limits on one row per axis, with room to type in each', () => {
    const fields = (measured[188] ?? []).filter((m) => m.case === 'limits' && m.kind === 'text-input');
    expect(fields.length).toBe(4);
    for (const f of fields) expect(f.content).toBeGreaterThan(45);
  });

  it('draws a lattice whose cells clear the 24 px target floor on BOTH axes', () => {
    // Six cells at the minimum rail. §48's whole first complaint: they were
    // 57.3 x 12 here, which fails WCAG 2.2 SC 2.5.8 on the short axis, and no
    // 12 px cell is a click target whatever its width.
    const cells = (measured[188] ?? []).filter((m) => m.case === 'cell' && m.kind === 'hud-lattice__cell');
    expect(cells.length).toBe(6);
    for (const c of cells) expect(c.width).toBeGreaterThanOrEqual(24);
    for (const c of cells) expect(c.height).toBeGreaterThanOrEqual(24);
  });
});
