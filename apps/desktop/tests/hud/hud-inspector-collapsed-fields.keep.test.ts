/* @layer tests @kind test */
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { chromium, type Browser } from 'playwright';
import { createElement as h } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { readFileSync } from 'fs';
import { ValueField } from '@app/views/HudLayoutEditor/sub-components/ValueField';
import { KeyframeTrack } from '@app/views/HudLayoutEditor/sub-components/KeyframeTrack';
import { PaintField } from '@app/views/HudLayoutEditor/sub-components/PaintField';
import { Field, Select } from '@drizztdourden08/tessera/primitives';
import { cssIn } from './files-in';
import { REPO_ROOT } from '../repo-root';
import { EDITOR_THEME_SHEETS } from './editor-theme-sheets.constants';

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

const scope = { life_current: 8 };
const noop = (): void => {};
const easings = ['linear', 'ease-out'].map((e) => ({ value: e, label: e }));

const transitionsRow = () => h('div', { className: 'hud-inspect__row' },
  h(ValueField, { label: 'duration (ms)', value: 200, onChange: noop, scope, min: 0 }),
  h(Field, {
    size: 'sm',
    label: 'easing',
    children: h(Select, { size: 'sm', value: '', placeholder: 'default', options: easings, onChange: noop }),
  }));

const expressionRow = () => h(ValueField, {
  label: 'opacity', value: { from: 'data', expr: 'life_current / 8' }, onChange: noop, scope,
});

const keyframeRows = () => h(KeyframeTrack, {
  keyframes: [{ at: 0, value: 1 }, { at: 1, value: 1.1 }],
  onChange: noop,
  scope,
  endLabel: '300ms',
  head: null,
});

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
    parseFloat(getComputedStyle(el).getPropertyValue(side)) || 0;
  const out: Measured[] = [];
  for (const sec of Array.from(document.querySelectorAll('[data-case]'))) {
    const rail = sec.getBoundingClientRect();
    for (const f of Array.from(sec.querySelectorAll('.number-input__field, .text-input, .slider__input'))) {
      const box = f.getBoundingClientRect();
      const wrap = f.closest('.number-input') ?? f.closest('.hud-value-input') ?? f;
      out.push({
        case: (sec as HTMLElement).dataset.case ?? '?',
        field: f.getAttribute('aria-label') ?? f.className,
        content: Math.round((box.width - px(f, 'padding-left') - px(f, 'padding-right')
          - px(f, 'border-left-width') - px(f, 'border-right-width')) * 10) / 10,
        overflow: Math.max(0, Math.round(wrap.getBoundingClientRect().right - rail.right)),
      });
    }
  }
  return out;
};

const measured: Record<number, Measured[]> = {};
let browser: Browser | undefined;

const find = (rail: number, field: string): Measured => {
  const hit = measured[rail]?.find((m) => m.field === field);
  if (!hit) throw new Error(`no field "${field}" measured at ${rail}px`);
  return hit;
};

beforeAll(async () => {
  const launched = await chromium.launch();
  browser = launched;
  const page = await launched.newPage();
  for (const rail of [289, 232, 188]) {
    await page.setContent(document_(rail));
    measured[rail] = await page.evaluate(probe);
  }
}, 60_000);

afterAll(async () => { await browser?.close(); });

describe('inspector rows that pair an intrinsic control with a numeric field', () => {
  it('renders a typeable transition duration at the default rail', () => {
    expect(find(289, 'duration (ms)').content).toBeGreaterThan(150);
  });

  it('still shows the duration at 232 px, the width the wireframes are drawn at', () => {
    expect(find(232, 'duration (ms)').content).toBeGreaterThan(100);
  });

  it('finally renders SOMETHING of the duration at the 188 px minimum', () => {
    expect(find(188, 'duration (ms)').content).toBeGreaterThan(50);
  });

  it('gives the expression field the width the "+ var" Select was hoarding', () => {
    expect(find(289, 'opacity').content).toBeGreaterThan(200);
    expect(find(232, 'opacity').content).toBeGreaterThan(150);
    expect(find(188, 'opacity').content).toBeGreaterThan(120);
  });

  it('gives the colour field room for a whole #rrggbb, down to 188 px', () => {
    expect(find(289, 'background hex').content).toBeGreaterThan(225);
    expect(find(232, 'background hex').content).toBeGreaterThan(170);
    expect(find(188, 'background hex').content).toBeGreaterThan(125);
  });

  it('keeps the keyframe position control readable', () => {
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
    expect(find(289, 'Value').content).toBeGreaterThan(200);
    expect(find(232, 'Value').content).toBeGreaterThan(150);
    expect(find(188, 'Value').content).toBeGreaterThan(120);
  });
});
