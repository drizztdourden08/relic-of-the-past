/* @layer tests @kind test */
/**
 * Phase 8 of `plans/hud-inspector-ux-review.html`. Appearance, MEASURED, on
 * the harness phases 1, 3 and 7 built: SSR the real components, load the real
 * token/primitive/editor stylesheets into headless Chromium, read the boxes at
 * 289 / 232 / 188 px.
 *
 * THE ONE CLAIM TO PROVE IS THE HEIGHT. The plan's whole case for
 * `SubsectionGroup` is that "closed, the redesign is one screen tall". The
 * section was ~1800 px of flat scroll with everything on. SSR renders the
 * component's INITIAL state, and the initial state is every group collapsed, so
 * the first describe below measures exactly the thing the plan promises, with
 * nothing mocked and no clicking required. `flat` is the same controls with
 * every group body rendered inline, which is the shape the section had before:
 * the two numbers side by side are the structural win, separate from any
 * density change.
 *
 * THE SECOND CLAIM IS THE COLOUR ROW, IN EVERY PLACE IT APPEARS. §34 measured
 * `PaintField`'s hex at 13.9 px of typing surface for a `#rrggbb` string, at
 * every rail, and the plan photographs it clipped to `#f(` in SIX places in
 * this one section. So the assertion is "every colour field in Appearance is
 * wide enough", not "a colour field is wide enough". Background, border,
 * outline, tint, shadow and a gradient stop are each measured by name.
 */
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { chromium, type Browser } from 'playwright';
import { createElement as h, type ReactNode } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { readFileSync, readdirSync } from 'fs';
import { join, resolve } from 'path';
import { AppearanceSection } from '../../apps/web/src/ui/domains/app/views/HudLayoutEditor/sub-components/sections/AppearanceSection';
import { GradientRamp } from '../../apps/web/src/ui/domains/app/views/HudLayoutEditor/sub-components/GradientRamp';
import { PaintField } from '../../apps/web/src/ui/domains/app/views/HudLayoutEditor/sub-components/PaintField';
import { SidesField } from '../../apps/web/src/ui/domains/app/views/HudLayoutEditor/sub-components/SidesField';
import { SlotChips } from '../../apps/web/src/ui/domains/app/views/HudLayoutEditor/sub-components/SlotChips';
import { SubsectionGroup } from '../../apps/web/src/ui/domains/app/views/HudLayoutEditor/sub-components/SubsectionGroup';
import { ValueField } from '../../apps/web/src/ui/domains/app/views/HudLayoutEditor/sub-components/ValueField';
import type { HudNode } from '../../shared/types/hud';

const ROOT = resolve(__dirname, '../..');
const DS = `${ROOT}/apps/web/src/ui/design-system`;
const ED = `${ROOT}/apps/web/src/ui/domains/app/views/HudLayoutEditor/sub-components`;

const cssIn = (dir: string): string[] => readdirSync(dir, { withFileTypes: true })
  .flatMap((e) => (e.isDirectory() ? cssIn(join(dir, e.name)) : (e.name.endsWith('.css') ? [join(dir, e.name)] : [])));

// Walked, not listed: this phase adds `HudLayoutEditor.appearance.css` and an
// explicit list would silently measure five unstyled controls.
const SHEETS = [
  ...cssIn(`${DS}/tokens`).filter((f) => !f.endsWith('index.css')),
  ...cssIn(`${DS}/primitives`),
  ...cssIn(ED),
];

const noop = (): void => {};
const scope = { life_current: 8 };

/** Every optional group on, which is the state the plan photographs at ~1800px. */
const LOADED: HudNode = {
  kind: 'container', id: 'panel', direction: 'row', children: [], opacity: 0.8,
  dimWhenEmpty: [5, 6, 7, 8],
  style: {
    background: '#101010',
    border: { width: 2, color: '#c8a84e', style: 'solid', sides: { top: true, right: true, bottom: true, left: false } },
    radius: 4,
    outline: { width: 1, color: '#f4f4f4' },
    tint: { color: '#ff8080', mode: 'multiply', amount: 1 },
    shadow: [{ x: 0, y: 2, blur: 4, color: '#000000' }, { x: 0, y: 0, blur: 8, color: '#c8a84e', inset: true }],
    clip: true,
  },
};

const section = () => h(AppearanceSection, { node: LOADED, onPatch: noop, scope });

/**
 * THE SAME SIX GROUPS, ALL OPEN. That is the shape the section had before this phase,
 * where every sub-editor was inline and nothing was summarised.
 *
 * WHY THE COMPARISON IS GROUP-TO-GROUP AND NOT SECTION-TO-SECTION. `visible`,
 * `opacity`, `radius`, `clip` and `dim when empty` are unconditional rows in
 * BOTH shapes. They are not sub-editors and this phase does not collapse them,
 * so including them in both sides of a ratio only dilutes the number being
 * measured. What the collapse buys is exactly the difference between these six
 * headers and these six bodies, and that is what is measured.
 *
 * The bodies are the NEW controls, deliberately: the old ones were `PaintField`'s
 * clipped colour row and four run-together checkboxes, both of which were taller
 * than what replaces them, so building the comparison out of today's controls
 * understates the win instead of flattering it.
 */
const group = (title: string, summary: string, swatch: string, ...body: ReactNode[]): ReactNode =>
  h(SubsectionGroup, { key: title, title, summary, swatch, open: true, onToggle: noop, enabled: true, onEnabledChange: noop }, ...body);

const shadowBody = (i: number): ReactNode[] => {
  const shadow = (LOADED.style?.shadow ?? [])[i];
  return [
    h('div', { key: 'g', className: 'grid' },
      ...(['x', 'y', 'blur', 'spread'] as const).map((k) => h(ValueField, {
        key: k, label: k, value: shadow[k] ?? 0, onChange: noop, scope,
      }))),
    h(PaintField, { key: 'c', label: `shadow ${i + 1} colour`, value: shadow.color, onChange: noop, scope }),
  ];
};

const expanded = (): ReactNode => h('div', { className: 'hud-inspect__group' },
  group('Background', '#101010', '#101010',
    h(PaintField, { key: 'p', label: 'background', value: '#101010', onChange: noop, scope, kinds: true })),
  group('Border', '2px solid, no left', '#c8a84e',
    h(ValueField, { key: 'w', label: 'width', value: 2, onChange: noop, scope, min: 0 }),
    h(PaintField, { key: 'c', label: 'border colour', value: '#c8a84e', onChange: noop, scope }),
    h(SidesField, { key: 's', label: 'sides', value: { left: false }, onChange: noop })),
  group('Outline', '1px, ink', '#f4f4f4',
    h(ValueField, { key: 'w', label: 'width', value: 1, onChange: noop, scope, min: 0 }),
    h(PaintField, { key: 'c', label: 'outline colour', value: '#f4f4f4', onChange: noop, scope })),
  group('Tint', 'multiply 1', '#ff8080',
    h(PaintField, { key: 'c', label: 'tint colour', value: '#ff8080', onChange: noop, scope }),
    h(ValueField, { key: 'a', label: 'amount', value: 1, onChange: noop, scope, min: 0, max: 1 })),
  group('Shadow 1', '0 2 4 #000000', '#000000', ...shadowBody(0)),
  group('Shadow 2', '0 0 8 #c8a84e inset', '#c8a84e', ...shadowBody(1)));

const CASES: Record<string, () => unknown> = {
  section,
  expanded,
  // One group opened on its own, which SSR cannot reach through the section's
  // own state. The body is what a click reveals, rendered directly.
  borderOpen: () => h(SubsectionGroup, {
    title: 'Border', summary: '2px solid, no left', swatch: '#c8a84e', open: true, onToggle: noop,
    enabled: true, onEnabledChange: noop,
  }, h(PaintField, { label: 'colour', value: '#c8a84e', onChange: noop, scope }),
    h(SidesField, { label: 'sides', value: { left: false }, onChange: noop })),
  gradient: () => h(PaintField, {
    label: 'background', kinds: true, onChange: noop, scope,
    value: { gradient: 'linear', angle: 0, stops: [{ at: 0, color: '#ffffff' }, { at: 1, color: '#000000' }] },
  }),
  ramp: () => h(GradientRamp, {
    kind: 'linear', onChange: noop,
    stops: [{ at: 0, color: '#ffffff' }, { at: 0.5, color: '#c8a84e' }, { at: 1, color: '#000000' }],
  }),
  chips: () => h(SlotChips, { label: 'dim when empty', value: [5, 6, 7, 8], onChange: noop }),
  sides: () => h(SidesField, { label: 'sides', value: undefined, onChange: noop }),
};

const document_ = (rail: number): string => {
  const body = Object.entries(CASES)
    .map(([id, node]) => `<section data-case="${id}">${renderToStaticMarkup(node() as never)}</section>`)
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

const probe = (): Measured[] => {
  const px = (el: Element, side: string): number =>
    parseFloat((getComputedStyle(el) as unknown as Record<string, string>)[side]) || 0;
  const sel = [
    '.hud-inspect__group', '.hud-subgroup', '.hud-subgroup__head', '.hud-subgroup__summary',
    '.hud-subgroup__swatch', '.hud-sides', '.hud-ramp__track', '.hud-slot-chips',
    '.hud-color-field', '.text-input', '.field__label', '.field__hint', '.hud-icon-choice',
  ].join(', ');
  // `Text`, `Flex` and `Box` prepend their OWN primitive class, so the first
  // class on the element is `text` or `flex` far more often than it is the one
  // the selector matched. The editor's classes are all `hud-`-prefixed, which
  // is what makes this reliable instead of positional.
  const kindOf = (el: Element): string =>
    Array.from(el.classList).find((c) => c.startsWith('hud-')) ?? el.className.split(' ')[0];
  const out: Measured[] = [];
  for (const sec of Array.from(document.querySelectorAll('[data-case]'))) {
    const rail = sec.getBoundingClientRect();
    for (const el of Array.from(sec.querySelectorAll(sel))) {
      const box = el.getBoundingClientRect();
      const line = parseFloat(getComputedStyle(el).lineHeight) || box.height;
      out.push({
        case: (sec as HTMLElement).dataset.case ?? '?',
        kind: kindOf(el),
        name: (el.getAttribute('aria-label') || (el as HTMLElement).innerText || '?').replace(/\s+/g, ' ').slice(0, 40),
        width: Math.round(box.width * 10) / 10,
        height: Math.round(box.height),
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
const RAILS = [289, 232, 188];
let browser: Browser;

const at = (rail: number, kind: string, kase?: string): Measured[] =>
  (measured[rail] ?? []).filter((m) => m.kind === kind && (kase === undefined || m.case === kase));

/** The hex box inside a named `ColorField`, by the aria-label `ColorField`
 *  writes. Scoped to a case, because a group's own editor labels its colour
 *  `colour`, and it is the group header that says which colour it is. */
const hex = (rail: number, kase: string, label: string): number => {
  const hit = (measured[rail] ?? [])
    .find((m) => m.case === kase && m.kind === 'text-input' && m.name === `${label} hex`);
  if (!hit) throw new Error(`no ColorField "${label}" in ${kase} at ${rail}px`);
  return hit.content;
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

describe('the longest section, collapsed', () => {
  it('fits one screen with every group closed and everything enabled', () => {
    // The rail is the window height less the editor's chrome: `.hud-editor`'s
    // 16px padding top and bottom, its 8px gap and the ~34px toolbar, so
    // H - 74. The shortest screen this editor targets is a 768px laptop. That gives
    // 694px of rail, and the Inspector's own label and the eight other section
    // headers take ~180 of it. The budget for Appearance's BODY is therefore
    // ~500px, and this is the number the plan's "one screen" means.
    for (const rail of RAILS) {
      const body = at(rail, 'hud-inspect__group', 'section')[0];
      expect(`${rail} collapsed ${body.height < 500}`).toBe(`${rail} collapsed true`);
    }
  });

  it('is a fraction of the same controls left uncollapsed', () => {
    // The structural claim, isolated: identical controls, same tier, same
    // stylesheet. The only difference is that four groups and two shadow cards
    // are shut. Anything under half is the win the plan describes; it measures
    // far better than that.
    for (const rail of RAILS) {
      const sum = (kase: string): number =>
        at(rail, 'hud-subgroup', kase).reduce((total, m) => total + m.height, 0);
      const closed = sum('section');
      const open = sum('expanded');
      expect(`${rail} groups closed ${closed < open / 3}`).toBe(`${rail} groups closed true`);
    }
  });

  it('spends one line per group, whatever the value in it', () => {
    // A header that wraps costs what opening the group would have cost, so the
    // summary ellipses instead. Six groups: four in the section plus two
    // shadow cards, each exactly one line at every rail.
    for (const rail of RAILS) {
      expect(`${rail} groups ${at(rail, 'hud-subgroup__head', 'section').length}`).toBe(`${rail} groups 6`);
      // The summary is the only part of the header that can run out of room,
      // so it is the one measured: it ellipses instead of wrapping.
      for (const s of at(rail, 'hud-subgroup__summary', 'section')) {
        expect(`${rail} summary lines ${s.lines}`).toBe(`${rail} summary lines 1`);
      }
    }
  });

  it('states each group value in its own header, closed', () => {
    // The property the flat scroll did not have: the author reads which group
    // is doing something without opening any of them.
    const summaries = at(289, 'hud-subgroup__summary', 'section').map((m) => m.name);
    expect(summaries).toEqual([
      '#101010', '2px solid, no left', '1px, ink', 'multiply 1', '0 2 4 #000000', '0 0 8 #c8a84e inset',
    ]);
  });

  it('draws a colour chip beside every group that has one', () => {
    // Six swatches for six groups. The gradient case paints a real gradient
    // instead of a first stop, which is why `swatchOf` builds CSS.
    expect(at(289, 'hud-subgroup__swatch', 'section').length).toBe(6);
    for (const chip of at(188, 'hud-subgroup__swatch', 'section')) expect(chip.width).toBe(16);
  });
});

describe('the colour row, in every place Appearance draws one', () => {
  it('leaves a whole #rrggbb typeable at 289 / 232 / 188, in all six', () => {
    // §34 measured the row this replaces at 13.9 px at EVERY rail. The floor
    // asserted here is 100 px at the 188 px minimum. That is seven times the old
    // number at the WORST rail, against `#rrggbb`'s ~50 px at `--text-sm`.
    const inGroup = ['background', 'border colour', 'outline colour', 'tint colour',
      'shadow 1 colour', 'shadow 2 colour'];
    for (const label of inGroup) {
      for (const rail of RAILS) {
        expect(`${rail}/${label} ${hex(rail, 'expanded', label) > 100}`).toBe(`${rail}/${label} true`);
      }
    }
    // A gradient stop's, the one nested a level deeper still inside the
    // background group's own ramp, and so with the least room to give.
    for (const rail of RAILS) {
      expect(`${rail}/stop ${hex(rail, 'ramp', 'stop 1') > 100}`).toBe(`${rail}/stop true`);
    }
  });

  it('is the same component in all of them', () => {
    // `ColorField` writes `.hud-color-field`, so counting the class counts the
    // call sites: nothing in this section hand-rolls a swatch beside a hex.
    expect(at(289, 'hud-color-field', 'expanded').length).toBe(6);
    expect(at(289, 'hud-color-field', 'ramp').length).toBe(1);
  });
});

describe("Appearance's own new controls", () => {
  it('draws the four border sides as a box, not four checkboxes in a run', () => {
    for (const rail of RAILS) {
      const box = at(rail, 'hud-sides', 'sides')[0];
      expect(`${rail} sides ${box.width}x${box.height}`).toBe(`${rail} sides 46x34`);
    }
  });

  it('gives the gradient ramp the full row at every rail', () => {
    // The ramp IS the gradient, so it takes the width the two stop rows used to
    // spend on a position spinner and a clipped hex.
    for (const rail of RAILS) {
      const track = at(rail, 'hud-ramp__track', 'ramp')[0];
      expect(`${rail} ramp ${track.width > rail - 40}`).toBe(`${rail} ramp true`);
      expect(`${rail} ramp height ${track.height}`).toBe(`${rail} ramp height 18`);
    }
  });

  it('costs the paint kind three icons instead of a full-width Select', () => {
    // 82 px is three 26 px `icon-btn--sm` and two 2 px gaps, the same figure at
    // every rail, against a `Select` that took 75% of the colour row.
    for (const rail of RAILS) {
      expect(`${rail} kinds ${at(rail, 'hud-icon-choice', 'gradient')[0].width}`).toBe(`${rail} kinds 82`);
    }
  });

  it('keeps four slot chips on one row at the default rail', () => {
    expect(at(289, 'hud-slot-chips', 'chips')[0].lines).toBe(1);
  });
});

describe('every Appearance row, at 289 / 232 / 188 px', () => {
  it('never lets a control escape the rail, down to 188 px', () => {
    for (const rail of RAILS) {
      for (const m of measured[rail] ?? []) {
        expect(`${rail}/${m.case}/${m.kind} overflow ${m.overflow}`)
          .toBe(`${rail}/${m.case}/${m.kind} overflow 0`);
      }
    }
  });

  it('keeps every label and hint on one line, down to the 188 px minimum', () => {
    for (const rail of RAILS) {
      for (const m of [...at(rail, 'field__label'), ...at(rail, 'field__hint')]) {
        expect(`${rail}/${m.case}/${m.name} lines ${m.lines}`).toBe(`${rail}/${m.case}/${m.name} lines 1`);
      }
    }
  });
});
