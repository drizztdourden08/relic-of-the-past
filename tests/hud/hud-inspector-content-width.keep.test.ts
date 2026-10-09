/* @layer tests @kind test */
// @vitest-environment jsdom
import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest';

vi.hoisted(() => {
  const global = globalThis as { window?: { api?: unknown } };
  global.window ??= {};
  const stub = (): unknown => new Proxy(async () => [], { get: (_target, key) => (key === 'then' ? undefined : stub()) });
  global.window.api ??= stub();
});

import { chromium, type Browser } from 'playwright';
import { createElement as h } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { readFileSync, readdirSync } from 'fs';
import { join, resolve } from 'path';
import { BoundedValueField } from '../../apps/desktop/src/ui/domains/app/views/HudLayoutEditor/sub-components/BoundedValueField';
import { ReferenceField } from '../../apps/desktop/src/ui/domains/app/views/HudLayoutEditor/sub-components/ReferenceField';
import { SlotRefField } from '../../apps/desktop/src/ui/domains/app/views/HudLayoutEditor/sub-components/SlotRefField';
import { TextValueField } from '../../apps/desktop/src/ui/domains/app/views/HudLayoutEditor/sub-components/content/TextValueField';
import { GlyphContent } from '../../apps/desktop/src/ui/domains/app/views/HudLayoutEditor/sub-components/content/GlyphContent';
import type { ModernSlot } from '@rotp/game-data';

const ROOT = resolve(__dirname, '../..');
const DS = `${ROOT}/node_modules/@drizztdourden08/tessera/src`;
const ED = `${ROOT}/apps/desktop/src/ui/domains/app/views/HudLayoutEditor/sub-components`;

const cssIn = (dir: string): string[] => readdirSync(dir, { withFileTypes: true })
  .flatMap((e) => (e.isDirectory() ? cssIn(join(dir, e.name)) : (e.name.endsWith('.css') ? [join(dir, e.name)] : [])));

const SHEETS = [
  ...cssIn(`${DS}/tokens`).filter((f) => !f.endsWith('index.css')),
  ...cssIn(`${DS}/theme`),
  `${ROOT}/apps/desktop/src/theme.css`,
  ...cssIn(`${DS}/primitives`),
  ...cssIn(`${DS}/composites`),
  ...cssIn(ED),
];

const noop = (): void => {};
const scope = { life_current: 112, life_max: 160, bomb_current: 7 };

const SLOTS: readonly ModernSlot[] = [1, 2, 3, 4].map((index) => ({
  index, binding: { type: 'none' }, label: `Slot ${index}`, position: 'SOUTH',
} as ModernSlot));

const CASES: Record<string, () => unknown> = {
  reference: () => h('div', null,
    h(ReferenceField, {
      label: 'control', name: 'DPAD', kind: 'generic', onOpen: noop, 'aria-label': 'ref-full',
    }),
    h(ReferenceField, {
      compact: true, action: 'go', name: 'Silver arrow icon', kind: 'sprite', onOpen: noop, 'aria-label': 'ref-compact',
    })),
  slot: () => h(SlotRefField, {
    label: 'slot', value: 9, onChange: noop, slots: SLOTS, glyphPacks: [], className: 'probe-slot',
  }),
  bounded: () => h(BoundedValueField, {
    label: 'fill', value: 0.5, onChange: noop, scope, min: 0, max: 1, step: 0.05,
  }),
  text: () => h(TextValueField, {
    value: { from: 'data', expr: 'bomb_current' }, onChange: noop, scope,
  }),
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
    for (const rail of RAILS) {
      const thumbs = (measured[rail] ?? []).filter((m) => m.case === 'reference' && m.what === 'thumb');
      expect(`${rail}: ${thumbs.map((t) => t.width).join('/')}`).toBe(`${rail}: 32/20`);
    }
  });

  it('gives the name whatever the picture and the caret do not need', () => {
    expect([289, 232, 188].map((rail) => at(rail, 'reference', 'name').width)).toEqual([170.8, 113.8, 69.8]);
  });

  it('is one row tall, at every rail, in both densities', () => {
    for (const rail of RAILS) {
      const rows = (measured[rail] ?? []).filter((m) => m.case === 'reference' && m.what === 'row');
      expect(`${rail}: ${rows.map((r) => r.height).join('/')}`).toBe(`${rail}: 38/26`);
    }
  });
});

describe('the new controls fit the rows they were added to', () => {
  it('lands the out-of-range note inside the rail at 188 px', () => {
    for (const rail of RAILS) {
      const note = at(rail, 'slot', 'note');
      expect(`${rail}: ${note.overflow} over, ${note.width} wide`)
        .toBe(`${rail}: 0 over, ${rail - 8} wide`);
      expect(`${rail}: ${note.height <= 54}`).toBe(`${rail}: true`);
    }
  });

  it('gives the bounded track something to drag at the minimum rail', () => {
    expect(at(289, 'bounded', 'track').width).toBe(277);
    expect(at(232, 'bounded', 'track').width).toBe(220);
    expect(at(188, 'bounded', 'track').width).toBe(176);
    expect(at(188, 'bounded', 'typing').content).toBe(141);
  });

  it('gives the text value the full row, now that the switch is not on it', () => {
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
