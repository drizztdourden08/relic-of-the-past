/* @layer tests @kind test */
/**
 * Phase 4 of `plans/hud-inspector-ux-review.html`, measured. The other half of
 * `hud-inspector-value-input.keep.test.ts`. Same harness as phases 1 and 3: SSR
 * the real components, load the real stylesheets into headless Chromium, and
 * measure at 289 / 232 / 188 px (the 320 default rail less 32, the width every
 * wireframe on that page is drawn at, and the 220 px minimum less 32).
 *
 * WHAT THE MODE SWITCH WAS WORTH. 66.3 px of `SegmentedControl`, which phase 3 had
 * already taken down from 86 at `md`, plus its 2 px gap, so 68.3 px back on
 * every numeric row in the panel. That is what turns the `duration`/`delay`
 * pair from 31.2 / 2.7 / 0 into 99.5 / 71 / 49.
 *
 * THE SHEETS ARE WALKED, NOT LISTED. Phase 1 and phase 3 both named the four
 * editor stylesheets explicitly; `ValueInput.css` lives in a folder of its own
 * and an explicit list measures an UNSTYLED control while still passing every
 * threshold, which is exactly the kind of green nobody reads twice.
 */
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { chromium, type Browser } from 'playwright';
import { createElement as h } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { readFileSync, readdirSync } from 'fs';
import { join, resolve } from 'path';
import { ValueField } from '../../apps/web/src/ui/domains/app/views/HudLayoutEditor/sub-components/ValueField';

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
const scope = { life_current: 112, life_max: 160 };

const CASES: Record<string, () => unknown> = {
  // Animation `duration`/`delay`, and GridTemplateEditor's `gap x`/`gap y`.
  // They are the identical shape, and the pair F1 photographs.
  pair: () => h('div', { className: 'hud-inspect__row' },
    h(ValueField, { label: 'duration (ms)', value: 300, onChange: noop, scope, min: 0 }),
    h(ValueField, { label: 'delay (ms)', value: 0, onChange: noop, scope })),
  // A half-width pair with a formula in one half: at rest, and promoted.
  promoted: () => h('div', { className: 'hud-inspect__row' },
    h(ValueField, { label: 'w', value: { from: 'data', expr: 'ceil(life_max / 8) * 8' }, onChange: noop, scope }),
    h(ValueField, { label: 'h', value: 24, onChange: noop, scope })),
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

interface Measured { case: string; field: string; content: number; overflow: number; top: number; left: number }

/**
 * `promote` puts the field into the state focusing it would (§58): the four
 * numbers `behavior/promote-overlay.ts` measures off the RESTING layout, then
 * the class that floats the control out of flow. The six lines below mirror that
 * file's `boxFor` because an SSR page has no React to focus. The hook itself is
 * driven for real, in the built app, by `tests/e2e/hud-layout-options.keep.spec.ts`.
 */
const probe = (promote: boolean): Measured[] => {
  if (promote) {
    for (const f of Array.from(document.querySelectorAll('[data-case="promoted"] .hud-value-field'))) {
      if (!f.querySelector('[data-formula="true"]')) continue;
      const root = f as HTMLElement;
      const control = root.querySelector('.field__control');
      const host = root.closest('.hud-inspect__row') ?? root.parentElement;
      if (!(control instanceof HTMLElement) || !(host instanceof HTMLElement)) continue;
      const rr = root.getBoundingClientRect();
      const hr = host.getBoundingClientRect();
      const cr = control.getBoundingClientRect();
      root.style.setProperty('--promote-left', `${Math.round(hr.left - rr.left)}px`);
      root.style.setProperty('--promote-top', `${Math.round(cr.top - rr.top)}px`);
      root.style.setProperty('--promote-width', `${Math.round(hr.width)}px`);
      root.style.setProperty('--promote-height', `${Math.round(rr.height)}px`);
      root.classList.add('hud-value-field--wide');
    }
  }
  const px = (el: Element, side: string): number =>
    parseFloat((getComputedStyle(el) as unknown as Record<string, string>)[side]) || 0;
  const out: Measured[] = [];
  for (const sec of Array.from(document.querySelectorAll('[data-case]'))) {
    const rail = sec.getBoundingClientRect();
    for (const f of Array.from(sec.querySelectorAll('.hud-value-input__field'))) {
      const box = f.getBoundingClientRect();
      out.push({
        case: (sec as HTMLElement).dataset.case ?? '?',
        field: f.getAttribute('aria-label') ?? '?',
        content: Math.round((box.width - px(f, 'paddingLeft') - px(f, 'paddingRight')
          - px(f, 'borderLeftWidth') - px(f, 'borderRightWidth')) * 10) / 10,
        overflow: Math.max(0, Math.round(box.right - rail.right)),
        top: Math.round(box.top - rail.top),
        left: Math.round(box.left - rail.left),
      });
    }
  }
  return out;
};

const rest: Record<number, Measured[]> = {};
const wide: Record<number, Measured[]> = {};
const RAILS = [289, 232, 188];
let browser: Browser;

const find = (from: Record<number, Measured[]>, rail: number, field: string): Measured => {
  const hit = from[rail]?.find((m) => m.field === field);
  if (!hit) throw new Error(`no field "${field}" at ${rail}px`);
  return hit;
};

beforeAll(async () => {
  browser = await chromium.launch();
  const page = await browser.newPage();
  for (const rail of RAILS) {
    await page.setContent(document_(rail));
    rest[rail] = await page.evaluate(probe, false);
    wide[rail] = await page.evaluate(probe, true);
  }
}, 60_000);

afterAll(async () => { await browser?.close(); });

describe('what deleting the mode switch is worth, measured', () => {
  it('finally makes the two-ValueField pair typeable at every rail', () => {
    // Contract §34.4 proved this row could not be fixed at `md`: "two
    // ValueFields share 281 px, so each gets 138.5. 138.5 < 141.3. Zero, before
    // and after." §35.6 got it to 31.2 / 2.7 / 0 on the compact tier. Deleting
    // the switch is worth another 68.3 px on every one of these fields.
    expect(find(rest, 289, 'duration (ms)').content).toBe(99.5);
    expect(find(rest, 232, 'duration (ms)').content).toBe(71);
    expect(find(rest, 188, 'duration (ms)').content).toBe(49);
    expect(find(rest, 188, 'delay (ms)').content).toBe(49);
  });

  it('leaves a half-width formula at half width until it is edited', () => {
    expect(find(rest, 232, 'w').content).toBe(66.5);
    // Side by side: `h` starts to the RIGHT of `w`. (Their tops differ because
    // the row is `align-items: flex-end` and the formula's result line makes
    // its Field taller. That is alignment, not a wrap.)
    expect(find(rest, 232, 'h').left).toBeGreaterThan(find(rest, 232, 'w').left);
  });

  it('NEVER MOVES THE SIBLING when a formula is promoted (§58)', () => {
    // §36 promoted by giving the field `flex: 1 0 100%`, so the pair REFLOWED:
    // the sibling dropped to a new row and every row under it moved down. It
    // pinned that reflow here as "same `left`, greater `top`", and the
    // maintainer's rule for this panel is that touching a control may not
    // rearrange what is beside it:
    //
    // > "NOTHING IN A FUCKING SECTION SHOULD CHANGE WHEN CLICKING ANY FUCKING
    // > OTHER OPTION IN THAT SAME FUCKING SECTION!"
    //
    // So the promotion is an OVERLAY now: the field's own box keeps the height
    // it had (`--promote-height`) and its `.field__control` is lifted out of
    // flow, spanning the row above its neighbours. This SSR harness can only
    // apply the class, and the class alone moves NOTHING, which is
    // exactly the claim. The geometry the hook measures is driven for real in
    // `tests/e2e/hud-layout-options.keep.spec.ts`, in the built app.
    // AND IT IS STILL THE WHOLE ROW OF TYPING SURFACE. That half of §36 is the
    // reason promotion exists and is unchanged; only the way it is taken is.
    // 233.5 / 176.5 / 132.5 against §36's 237.5 / 180.5 / 136.5: the 4px is the
    // 2px of padding the floated control wears on each side so it reads as a
    // card sitting ON the row, not as a field that grew.
    expect(find(wide, 289, 'w').content).toBe(233.5);
    expect(find(wide, 232, 'w').content).toBe(176.5);
    expect(find(wide, 188, 'w').content).toBe(132.5);
    for (const rail of RAILS) {
      const before = find(rest, rail, 'h');
      const after = find(wide, rail, 'h');
      expect(`${rail} sibling top ${after.top}`).toBe(`${rail} sibling top ${before.top}`);
      expect(`${rail} sibling left ${after.left}`).toBe(`${rail} sibling left ${before.left}`);
      expect(`${rail} sibling width ${after.content}`)
        .toBe(`${rail} sibling width ${before.content}`);
    }
  });

  it('never lets a promoted field escape the rail, down to 188 px', () => {
    for (const rail of RAILS) {
      for (const m of [...(rest[rail] ?? []), ...(wide[rail] ?? [])]) {
        expect(`${rail}/${m.case}/${m.field} overflow ${m.overflow}`)
          .toBe(`${rail}/${m.case}/${m.field} overflow 0`);
      }
    }
  });
});
