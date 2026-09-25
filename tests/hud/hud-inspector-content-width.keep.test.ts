// @vitest-environment jsdom
/* @layer tests @kind test */
/**
 * Phase 9 of `plans/hud-inspector-ux-review.html`, MEASURED. The other half of
 * `hud-inspector-content.keep.test.ts`. Same harness as phases 1, 3, 4 and 7:
 * SSR the real components, load the real stylesheets into headless Chromium,
 * and measure at 289 / 232 / 188 px (the 320 default rail less 32, the width
 * every wireframe on that page is drawn at, and the 220 px minimum less 32).
 *
 * WHAT IS BEING CHECKED IS MOSTLY THE OPPOSITE OF PHASE 4'S. Phase 4 measured
 * typing surface, because the complaint was a field too narrow to type in.
 * Three of the four controls here are READ, not typed into, so what is
 * measured is: the artwork is drawn at a size a person can identify (26 px, and
 * 16.3 px for a reference stacked inside a card, which is 2rem and 1.25rem against the
 * design system's own 13 px root), the name beside it gets exactly what the
 * picture and the caret do not need, and NOTHING overflows the rail at 188 px,
 * including the slot field's out-of-range note, which is new text in a row that
 * was already at the edge. The fourth, the text value, IS typed into, and it is
 * measured the way phase 4 measured its own.
 *
 * THE SHEETS ARE WALKED, NOT LISTED, for §36.8's reason: `ValueInput.css` and
 * now `HudLayoutEditor.content.css` are found by walking the directory, so a
 * new sheet cannot be silently left out of the measurement.
 */
import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest';

// SSR only needs a DOM to satisfy the app-lib modules `glyph-art` reaches at
// import time (a log bus that binds `window`, a device store that calls the
// desktop bridge). The MEASUREMENT still happens in real Chromium below; this
// jsdom is never rendered into.
vi.hoisted(() => {
  const global = globalThis as { window?: { api?: unknown } };
  global.window ??= {};
  global.window.api ??= new Proxy({}, { get: () => async () => [] });
});

import { chromium, type Browser } from 'playwright';
import { createElement as h } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { readFileSync, readdirSync } from 'fs';
import { join, resolve } from 'path';
import { BoundedValueField } from '../../apps/web/src/ui/domains/app/views/HudLayoutEditor/sub-components/BoundedValueField';
import { ReferenceField } from '../../apps/web/src/ui/domains/app/views/HudLayoutEditor/sub-components/ReferenceField';
import { SlotRefField } from '../../apps/web/src/ui/domains/app/views/HudLayoutEditor/sub-components/SlotRefField';
import { TextValueField } from '../../apps/web/src/ui/domains/app/views/HudLayoutEditor/sub-components/content/TextValueField';
import { GlyphContent } from '../../apps/web/src/ui/domains/app/views/HudLayoutEditor/sub-components/content/GlyphContent';
import type { ModernSlot } from '../../shared/types/controls';

const ROOT = resolve(__dirname, '../..');
const DS = `${ROOT}/apps/web/src/ui/design-system`;
const ED = `${ROOT}/apps/web/src/ui/domains/app/views/HudLayoutEditor/sub-components`;

const cssIn = (dir: string): string[] => readdirSync(dir, { withFileTypes: true })
  .flatMap((e) => (e.isDirectory() ? cssIn(join(dir, e.name)) : (e.name.endsWith('.css') ? [join(dir, e.name)] : [])));

const SHEETS = [
  ...cssIn(`${DS}/tokens`).filter((f) => !f.endsWith('index.css')),
  ...cssIn(`${DS}/primitives`),
  ...cssIn(ED),
];

const noop = (): void => {};
const scope = { life_current: 112, life_max: 160, bomb_current: 7 };

const SLOTS: readonly ModernSlot[] = [1, 2, 3, 4].map((index) => ({
  index, binding: { type: 'none' }, label: `Slot ${index}`, position: 'SOUTH',
} as ModernSlot));

const CASES: Record<string, () => unknown> = {
  // The four kinds that were slugs, at their two densities.
  reference: () => h('div', null,
    h(ReferenceField, {
      label: 'control', name: 'DPAD', kind: 'generic', onOpen: noop, 'aria-label': 'ref-full',
    }),
    h(ReferenceField, {
      compact: true, action: 'go', name: 'Silver arrow icon', kind: 'sprite', onOpen: noop, 'aria-label': 'ref-compact',
    })),
  // A number past the previewed scheme: the note is a whole extra line in a
  // row that was already at the rail's edge.
  slot: () => h(SlotRefField, {
    label: 'slot', value: 9, onChange: noop, slots: SLOTS, glyphPacks: [], className: 'probe-slot',
  }),
  // A bounded scalar: the number, and the track under it.
  bounded: () => h(BoundedValueField, {
    label: 'fill', value: 0.5, onChange: noop, scope, min: 0, max: 1, step: 0.05,
  }),
  // The text value, with the outer mode switch gone. It is the one control here
  // that IS typed into, so its typing surface is measured like phase 4's.
  text: () => h(TextValueField, {
    value: { from: 'data', expr: 'bomb_current' }, onChange: noop, scope,
  }),
  // The whole glyph editor as it is actually assembled, because its own
  // source/`shows` switch carries two full phrases instead of two words and
  // a `SegmentedControl` that wraps at 188 px would be a new F2.
  glyph: () => h(GlyphContent, {
    spec: { type: 'glyph', position: 'DPAD' }, onChange: noop, glyphPacks: [],
  } as never),
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
  case: string; what: string; width: number; height: number; overflow: number;
  /** Inside the padding and the border, so it compares with §36.7's own figures. */
  content: number;
}

const probe = (): Measured[] => {
  const out: Measured[] = [];
  const px = (el: Element, side: string): number =>
    parseFloat((getComputedStyle(el) as unknown as Record<string, string>)[side]) || 0;
  for (const sec of Array.from(document.querySelectorAll('[data-case]'))) {
    const rail = sec.getBoundingClientRect();
    const kase = (sec as HTMLElement).dataset.case ?? '?';
    const add = (what: string, el: Element): void => {
      const box = el.getBoundingClientRect();
      out.push({
        case: kase,
        what,
        width: Math.round(box.width * 10) / 10,
        height: Math.round(box.height * 10) / 10,
        overflow: Math.max(0, Math.round(box.right - rail.right)),
        content: Math.round((box.width - px(el, 'paddingLeft') - px(el, 'paddingRight')
          - px(el, 'borderLeftWidth') - px(el, 'borderRightWidth')) * 10) / 10,
      });
    };
    for (const el of Array.from(sec.querySelectorAll('.hud-ref-field'))) add('row', el);
    for (const el of Array.from(sec.querySelectorAll('.hud-ref-field__thumb'))) add('thumb', el);
    for (const el of Array.from(sec.querySelectorAll('.hud-ref-field__name'))) add('name', el);
    for (const el of Array.from(sec.querySelectorAll('.hud-slot-ref__note'))) add('note', el);
    for (const el of Array.from(sec.querySelectorAll('.slider__input'))) add('track', el);
    for (const el of Array.from(sec.querySelectorAll('.hud-value-input__field'))) add('typing', el);
    for (const el of Array.from(sec.querySelectorAll('.segmented__track'))) add('switch', el);
  }
  return out;
};

const measured: Record<number, Measured[]> = {};
const RAILS = [289, 232, 188];
let browser: Browser;

const at = (rail: number, kase: string, what: string): Measured => {
  const hit = (measured[rail] ?? []).find((m) => m.case === kase && m.what === what);
  if (!hit) throw new Error(`no ${kase}/${what} at ${rail}px`);
  return hit;
};

beforeAll(async () => {
  browser = await chromium.launch();
  const page = await browser.newPage();
  for (const rail of RAILS) {
    await page.setContent(document_(rail));
    measured[rail] = await page.evaluate(probe);
  }
}, 60_000);

afterAll(async () => { await browser?.close(); });

describe('a reference is legible at every rail', () => {
  it('draws the artwork at one fixed size and never scales it away', () => {
    // 2rem / 1.25rem against the design system's own 13px root, so 26 and 16.3.
    // `flex-shrink: 0` is the whole claim: a long manifest label eats the NAME,
    // never the picture, and the picture is the same at 188 px as at 289.
    for (const rail of RAILS) {
      const thumbs = (measured[rail] ?? []).filter((m) => m.case === 'reference' && m.what === 'thumb');
      expect(`${rail}: ${thumbs.map((t) => t.width).join('/')}`).toBe(`${rail}: 26/16.3`);
    }
  });

  it('gives the name whatever the picture and the caret do not need', () => {
    // The name is the only elastic part of the row, so these ARE the row width
    // minus the picture, the caret, the kind and three gaps.
    expect(at(289, 'reference', 'name').width).toBe(186.1);
    expect(at(232, 'reference', 'name').width).toBe(129.1);
    // 85.1 px at the minimum rail holds "Silver arrow icon" to the `i` and
    // ellipsises the rest, which is the trade `min-width: 0` buys: the caret
    // stays on screen instead of being pushed off by a long label.
    expect(at(188, 'reference', 'name').width).toBe(85.1);
  });

  it('is one row tall, at every rail, in both densities', () => {
    for (const rail of RAILS) {
      const rows = (measured[rail] ?? []).filter((m) => m.case === 'reference' && m.what === 'row');
      expect(`${rail}: ${rows.map((r) => r.height).join('/')}`).toBe(`${rail}: 32/22.5`);
    }
  });
});

describe('the new controls fit the rows they were added to', () => {
  it('lands the out-of-range note inside the rail at 188 px', () => {
    for (const rail of RAILS) {
      const note = at(rail, 'slot', 'note');
      expect(`${rail}: ${note.overflow} over, ${note.width} wide`)
        .toBe(`${rail}: 0 over, ${rail - 8} wide`);
      // Two lines of `--text-xs`, wrapped, not clipped, at every rail.
      expect(`${rail}: ${note.height}`).toBe(`${rail}: 30`);
    }
  });

  it('gives the bounded track something to drag at the minimum rail', () => {
    expect(at(289, 'bounded', 'track').width).toBe(277);
    expect(at(232, 'bounded', 'track').width).toBe(220);
    // 176 px of travel over 20 steps of 0.05 is 8.8 px a step at the narrowest
    // rail this panel goes to. Coarse, and still a handle instead of a
    // caption. The number beside it is how 0.35 gets typed exactly.
    expect(at(188, 'bounded', 'track').width).toBe(176);
    expect(at(188, 'bounded', 'typing').content).toBe(141);
  });

  it('gives the text value the full row, now that the switch is not on it', () => {
    // Comparable with §36.7's own content figures. A committed formula in a
    // full-width numeric row measured 237.5 / 180.5 / 136.5 there; this row is
    // wider still because it carries no spinner column and no half-width
    // sibling. It is 263 px at the default rail for `= bomb_current`, which used to
    // be clipped to `bomb_curre` behind two mode switches.
    expect(at(289, 'text', 'typing').content).toBe(263);
    expect(at(232, 'text', 'typing').content).toBe(206);
    expect(at(188, 'text', 'typing').content).toBe(162);
  });
});

describe('nothing this phase added escapes the rail', () => {
  it('overflows by zero, everywhere, down to 188 px', () => {
    for (const rail of RAILS) {
      for (const m of measured[rail] ?? []) {
        expect(`${rail}/${m.case}/${m.what} overflow ${m.overflow}`)
          .toBe(`${rail}/${m.case}/${m.what} overflow 0`);
      }
    }
  });
});
