/* @layer tests @kind test */
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { chromium, type Browser } from 'playwright';
import { createElement as h } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { readFileSync, readdirSync } from 'fs';
import { join, resolve } from 'path';
import { ValueField } from '../../apps/web/src/ui/domains/app/views/HudLayoutEditor/sub-components/ValueField';

const ROOT = resolve(__dirname, '../..');
const DS = `${ROOT}/node_modules/@drizztdourden08/tessera/src`;
const ED = `${ROOT}/apps/web/src/ui/domains/app/views/HudLayoutEditor/sub-components`;

const cssIn = (dir: string): string[] => readdirSync(dir, { withFileTypes: true })
  .flatMap((e) => (e.isDirectory() ? cssIn(join(dir, e.name)) : (e.name.endsWith('.css') ? [join(dir, e.name)] : [])));

const SHEETS = [
  ...cssIn(`${DS}/tokens`).filter((f) => !f.endsWith('index.css')),
  ...cssIn(`${DS}/theme`),
  `${ROOT}/apps/web/src/theme.css`,
  ...cssIn(`${DS}/primitives`),
  ...cssIn(`${DS}/composites`),
  ...cssIn(ED),
];

const noop = (): void => {};
const scope = { life_current: 112, life_max: 160 };

const CASES: Record<string, () => unknown> = {
  pair: () => h('div', { className: 'hud-inspect__row' },
    h(ValueField, { label: 'duration (ms)', value: 300, onChange: noop, scope, min: 0 }),
    h(ValueField, { label: 'delay (ms)', value: 0, onChange: noop, scope })),
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
    expect(find(rest, 289, 'duration (ms)').content).toBe(99.5);
    expect(find(rest, 232, 'duration (ms)').content).toBe(71);
    expect(find(rest, 188, 'duration (ms)').content).toBe(49);
    expect(find(rest, 188, 'delay (ms)').content).toBe(49);
  });

  it('leaves a half-width formula at half width until it is edited', () => {
    expect(find(rest, 232, 'w').content).toBe(63.2);
    expect(find(rest, 232, 'h').left).toBeGreaterThan(find(rest, 232, 'w').left);
  });

  it('NEVER MOVES THE SIBLING when a formula is promoted (§58)', () => {
    expect([289, 232, 188].map((rail) => find(wide, rail, 'w').content)).toEqual([230.2, 173.2, 129.2]);
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
