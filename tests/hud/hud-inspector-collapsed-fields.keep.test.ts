/* @layer tests @kind test */
/**
 * Phase 1 of `plans/hud-inspector-ux-review.html` covers finding F2, "flex rows with
 * no min-width: fields collapsed to zero". The claim under test is a LAYOUT
 * claim ("a transition's duration field does not render at all"), so asserting
 * declarations would prove nothing: the bug is what the flex algorithm does
 * with them. There is no jsdom in this repo, and jsdom performs no layout
 * anyway, so the rows are rendered for real, in headless Chromium, against
 * the actual token/primitive/editor stylesheets, and measured.
 *
 * WIDTHS. The inspector rail is 220-480 with a 320 default and a control gets
 * `rail - 32` (the plan's "measurement that drives all of this"): 289 px at the
 * default, 188 px at the minimum. Both are asserted, and they assert DIFFERENT
 * things. 188 px is below the floor the current control tier can serve, which
 * is the plan's own finding and phase 2's job, so at 188 the only claim made
 * here is that nothing overflows the rail.
 *
 * Every threshold below was 0 before the fix.
 */
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { chromium, type Browser } from 'playwright';
import { createElement as h } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { readFileSync, readdirSync } from 'fs';
import { join, resolve } from 'path';
import { ValueField } from '../../apps/web/src/ui/domains/app/views/HudLayoutEditor/sub-components/ValueField';
import { KeyframeTrack } from '../../apps/web/src/ui/domains/app/views/HudLayoutEditor/sub-components/KeyframeTrack';
import { PaintField } from '../../apps/web/src/ui/domains/app/views/HudLayoutEditor/sub-components/PaintField';
import { Field } from '../../apps/web/src/ui/design-system/primitives/Field';
import { Select } from '../../apps/web/src/ui/design-system/primitives/Select';

const ROOT = resolve(__dirname, '../..');
const DS = `${ROOT}/apps/web/src/ui/design-system`;
const ED = `${ROOT}/apps/web/src/ui/domains/app/views/HudLayoutEditor/sub-components`;

const cssIn = (dir: string): string[] => readdirSync(dir, { withFileTypes: true })
  .flatMap((e) => (e.isDirectory() ? cssIn(join(dir, e.name)) : (e.name.endsWith('.css') ? [join(dir, e.name)] : [])));

// tokens/index.css is only a list of @imports, which setContent will not resolve.
const SHEETS = [
  ...cssIn(`${DS}/tokens`).filter((f) => !f.endsWith('index.css')),
  ...cssIn(`${DS}/primitives`),
  // Walked, not listed: phase 4 added `ValueInput/ValueInput.css` in a folder
  // of its own, and an explicit list silently measures an unstyled control.
  ...cssIn(ED),
];

const scope = { life_current: 8 };
const noop = (): void => {};
const easings = ['linear', 'ease-out'].map((e) => ({ value: e, label: e }));

/**
 * The Transitions duration row, exactly as `TransitionsSection` renders it.
 * Phase 3 put the easing `Select` in a `Field` of its own so it has a label; the
 * `Field` is deliberately NOT `.hud-inspect__extent`, so it stays content-sized
 * and the duration keeps the rest of the row (see the numbers below).
 */
const transitionsRow = () => h('div', { className: 'hud-inspect__row' },
  h(ValueField, { label: 'duration (ms)', value: 200, onChange: noop, scope, min: 0 }),
  h(Field, { size: 'sm', label: 'easing' },
    h(Select, { size: 'sm', value: '', placeholder: 'default', options: easings, onChange: noop })));

/** A committed formula. Phase 4 deleted both the mode switch in front of it
 *  and the `+ var` Select beside it, so it is the whole row now. */
const expressionRow = () => h(ValueField, {
  label: 'opacity', value: { from: 'data', expr: 'life_current / 8' }, onChange: noop, scope,
});

/**
 * PHASE 10 REPLACED THE ROW WITH A TRACK. `.hud-keyframes__row` put `at`, the
 * value, an easing `Select` and a delete button on ONE flex line, and that
 * shape is what pinned the value at 0 px for three phases. `at` and the
 * `Select` each declared `width: 100%`, which on a flex item is a 100% BASIS,
 * so there was no positive free space for the value's `flex: 1 1 0` to grow
 * into. `KeyframeTrack` edits ONE key at a time and gives its three fields
 * three full-width rows, which is what this now measures.
 */
const keyframeRows = () => h(KeyframeTrack, {
  keyframes: [{ at: 0, value: 1 }, { at: 1, value: 1.1 }],
  onChange: noop,
  scope,
  endLabel: '300ms',
  head: null,
});

/**
 * `.hud-paint-field__row` is a FIFTH row of the same shape, not among F2's four.
 * The colour control behind background, border, shadow, outline, tint, text
 * colour and text stroke, so the most-rendered row in Appearance.
 *
 * PHASE 8 REPLACED ITS INSIDES. `PaintField`'s flat branch is a `ColorField`
 * now and the kind `Select` that was starving the hex is three icons on a row
 * of its own, so the field this measures is reached under the aria-label
 * `ColorField` writes (`<label> hex`) instead of the bare label. The row is
 * still `PaintField`'s and it is still the most-rendered one in Appearance.
 * What changed is that it is no longer hand-rolled here.
 */
const paintRow = () => h(PaintField, {
  label: 'background', value: '#3a2a10', onChange: noop, scope: {},
});

const CASES = {
  transitions: transitionsRow,
  expression: expressionRow,
  keyframes: keyframeRows,
  paint: paintRow,
} as const;

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

interface Measured { case: string; field: string; content: number; overflow: number }

const probe = (): Measured[] => {
  const px = (el: Element, side: string): number =>
    parseFloat((getComputedStyle(el) as unknown as Record<string, string>)[side]) || 0;
  const out: Measured[] = [];
  for (const sec of Array.from(document.querySelectorAll('[data-case]'))) {
    const rail = sec.getBoundingClientRect();
    // `.slider__input` joined the list in phase 10: `at` is a `Slider` now, and
    // an `input[type=range]` has an intrinsic ~129 px width that behaves as an
    // automatic flex MINIMUM. It is the one control on this page that
    // overflows a narrow rail instead of collapsing inside it.
    for (const f of Array.from(sec.querySelectorAll('.number-input__field, .text-input, .slider__input'))) {
      const box = f.getBoundingClientRect();
      const wrap = f.closest('.number-input') ?? f.closest('.hud-value-input') ?? f;
      out.push({
        case: (sec as HTMLElement).dataset.case ?? '?',
        // `Slider` takes no `aria-label`, so the range input is found by its
        // own class instead. It is the only member of this list without one.
        field: f.getAttribute('aria-label') ?? f.className,
        // The typing surface: the field's box less its own padding and border.
        content: Math.round((box.width - px(f, 'paddingLeft') - px(f, 'paddingRight')
          - px(f, 'borderLeftWidth') - px(f, 'borderRightWidth')) * 10) / 10,
        overflow: Math.max(0, Math.round(wrap.getBoundingClientRect().right - rail.right)),
      });
    }
  }
  return out;
};

const measured: Record<number, Measured[]> = {};
let browser: Browser;

const find = (rail: number, field: string): Measured => {
  const hit = measured[rail]?.find((m) => m.field === field);
  if (!hit) throw new Error(`no field "${field}" measured at ${rail}px`);
  return hit;
};

beforeAll(async () => {
  browser = await chromium.launch();
  const page = await browser.newPage();
  for (const rail of [289, 232, 188]) {
    await page.setContent(document_(rail));
    measured[rail] = await page.evaluate(probe);
  }
}, 60_000);

afterAll(async () => { await browser?.close(); });

describe('inspector rows that pair an intrinsic control with a numeric field', () => {
  it('renders a typeable transition duration at the default rail', () => {
    // Was 0: `.select-trigger` is `width: 100%`, which on a flex item is a 100%
    // BASIS, so the Select claimed all 281 px and the ValueField beside it got
    // none. Phase 1 took it to 68.3, phase 3's compact tier to 104.3, and
    // phase 4's deletion of the mode switch to 172.6.
    expect(find(289, 'duration (ms)').content).toBeGreaterThan(160);
  });

  it('still shows the duration at 232 px, the width the wireframes are drawn at', () => {
    // 11.3 after phase 1, 47.3 after phase 3, 115.6 after phase 4.
    expect(find(232, 'duration (ms)').content).toBeGreaterThan(100);
  });

  it('finally renders SOMETHING of the duration at the 188 px minimum', () => {
    // 0 through phase 1, 3.3 after phase 3. That is inside the rail and no longer
    // collapsed, but three pixels is not a typing surface. Phase 4 deleted the
    // 66.3 px mode switch in front of it and it is 71.6 px at the MINIMUM rail.
    expect(find(188, 'duration (ms)').content).toBeGreaterThan(60);
  });

  it('gives the expression field the width the "+ var" Select was hoarding', () => {
    // The Select is gone entirely. `FormulaMenu` is a popover on the ƒ chip,
    // so a committed formula now has the whole row: 237.5 / 180.5 / 136.5.
    expect(find(289, 'opacity').content).toBeGreaterThan(200);
    expect(find(232, 'opacity').content).toBeGreaterThan(150);
    expect(find(188, 'opacity').content).toBeGreaterThan(120);
  });

  it('gives the colour field room for a whole #rrggbb, down to 188 px', () => {
    // Was 13.9 px at EVERY rail, which the plan photographs under F1 as "a colour
    // row clipped to #0", because the mode Select was on a 100% basis and
    // `.hud-paint-field__swatch-wrap` had `flex: 1` with no `min-width: 0`.
    // The only field on this page that works at the 220 px minimum rail.
    //
    // PHASE 8 re-measured it and the thresholds are tightened to what the row
    // actually does now that the kind `Select` is off it entirely: 253 / 196 /
    // 152 px, against phase 1's 166.1 / 109.1 / 65.1. The old floors are left
    // in the comment instead of the assertion, because a regression back to
    // them is exactly what this pin exists to catch.
    expect(find(289, 'background hex').content).toBeGreaterThan(240);
    expect(find(232, 'background hex').content).toBeGreaterThan(180);
    expect(find(188, 'background hex').content).toBeGreaterThan(140);
  });

  it('keeps the keyframe position control readable', () => {
    // Was a `NumberInput` in a four-control flex row (60.7 / 15.9 px of typing
    // surface). It is a bounded 0-1, dragged far more often than typed, so phase
    // 10 made `at` the `Slider` the inspector had never once imported, on a row
    // of its own: 251 / 194 / 150 px of actual track.
    expect(find(289, 'slider__input').content).toBeGreaterThan(200);
    expect(find(232, 'slider__input').content).toBeGreaterThan(150);
    expect(find(188, 'slider__input').content).toBeGreaterThan(120);
  });

  it('never lets a field escape the rail, down to the 188 px minimum', () => {
    for (const rail of [289, 232, 188]) {
      for (const m of measured[rail] ?? []) {
        expect(`${rail}/${m.case}/${m.field} overflow ${m.overflow}`).toBe(`${rail}/${m.case}/${m.field} overflow 0`);
      }
    }
  });

  it('finally gives the keyframe value a typing surface, which phases 1, 3 and 4 all left pinned at 0', () => {
    // THE LONGEST-STANDING NUMBER ON THIS PAGE. Pinned at 0 by phase 1,
    // re-measured by phase 3 (still 0) and by phase 4 the day §34.4 said to
    // re-measure, since the mode switch was gone entirely by then. It was
    // STILL 0 at all three rails, and §35.7 said exactly why:
    // `.hud-keyframes__row` carried `at`, the value, an easing `Select` and a
    // delete button; `at` and the `Select` are both `width: 100%`, which on a
    // flex item is a 100% BASIS, so the row had NO POSITIVE FREE SPACE for the
    // value's `flex: 1 1 0` to grow into. Deleting the switch freed 68.3 px
    // and `at` absorbed it (71.7 -> 87.7) instead of the value. The
    // constraint was never the tier and never the switch. It was the row's
    // shape, which is why no rule could have fixed it.
    //
    // PHASE 10 CHANGED THE SHAPE. `KeyframeTrack` edits ONE key at a time, so
    // `at`, the value and the easing are three FULL-WIDTH rows under a track
    // instead of four controls on one line. That is the "redrawn" note in the plan's
    // own `What the drawing changed`. Measured: 242 / 185 / 141 px.
    expect(find(289, 'Value').content).toBeGreaterThan(200);
    expect(find(232, 'Value').content).toBeGreaterThan(150);
    expect(find(188, 'Value').content).toBeGreaterThan(120);
  });
});
