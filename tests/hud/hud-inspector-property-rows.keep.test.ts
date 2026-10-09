/* @layer tests @kind test */
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { chromium, type Browser } from 'playwright';
import { createElement as h } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { existsSync, readFileSync, readdirSync } from 'fs';
import { join, resolve } from 'path';
import { EdgesField } from '../../apps/desktop/src/ui/domains/app/views/HudLayoutEditor/sub-components/EdgesField';
import { ValueField } from '../../apps/desktop/src/ui/domains/app/views/HudLayoutEditor/sub-components/ValueField';
import { Field, SegmentedControl } from '@drizztdourden08/tessera/primitives';

const ROOT = resolve(__dirname, '../..');
const DS = `${ROOT}/node_modules/@drizztdourden08/tessera/src`;
const EDITOR = `${ROOT}/apps/desktop/src/ui/domains/app/views/HudLayoutEditor`;
const ED = `${EDITOR}/sub-components`;

const filesIn = (dir: string, ext: string): string[] => readdirSync(dir, { withFileTypes: true })
  .flatMap((e) => (e.isDirectory() ? filesIn(join(dir, e.name), ext) : (e.name.endsWith(ext) ? [join(dir, e.name)] : [])));

const SHEETS = [
  ...filesIn(`${DS}/tokens`, '.css').filter((f) => !f.endsWith('index.css')),
  ...filesIn(`${DS}/theme`, '.css'),
  `${ROOT}/apps/desktop/src/theme.css`,
  ...filesIn(`${DS}/primitives`, '.css'),
  ...filesIn(`${DS}/composites`, '.css'),
  ...filesIn(ED, '.css'),
];

const noop = (): void => {};
const scope = { life_current: 8 };
const seg = (...labels: string[]) => labels.map((label) => ({ value: label, label }));

const SEGMENTS: readonly (readonly string[])[] = [
  ['flex', 'grid'], ['uniform', 'per corner'], ['none', 'loop', 'ping-pong'],
  ['game sprite', 'font'], ['fixed position', 'slot'], ['text', 'ƒx'], ['glyph', 'image'],
  ['verb', 'slot'],
];

const CASES: Record<string, () => unknown> = {
  sides: () => h(EdgesField, { label: 'sides', value: undefined, onChange: noop }),
  pair: () => h('div', { className: 'hud-inspect__row' },
    h(ValueField, { label: 'duration (ms)', value: 300, onChange: noop, scope, min: 0 }),
    h(ValueField, { label: 'delay (ms)', value: 0, onChange: noop, scope })),
  segments: () => h('div', null, ...SEGMENTS.map((options, i) => h(
    Field, { key: i, size: 'sm', label: `seg${i}` },
    h(SegmentedControl, { size: 'sm', value: options[0], options: seg(...options), onChange: noop }),
  ))),
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
  width: number; content: number; lines: number; overflow: number;
}

const probe = (): Measured[] => {
  const px = (el: Element, side: string): number =>
    parseFloat((getComputedStyle(el) as unknown as Record<string, string>)[side]) || 0;
  const out: Measured[] = [];
  for (const sec of Array.from(document.querySelectorAll('[data-case]'))) {
    const rail = sec.getBoundingClientRect();
    const sel = '.field__label, .segmented__track, .checkbox, .number-input, .number-input__field, .hud-value-input__field';
    for (const el of Array.from(sec.querySelectorAll(sel))) {
      const box = el.getBoundingClientRect();
      const line = parseFloat(getComputedStyle(el).lineHeight) || box.height;
      out.push({
        case: (sec as HTMLElement).dataset.case ?? '?',
        kind: el.className.split(' ')[0],
        name: ((el as HTMLElement).innerText || el.getAttribute('aria-label') || '?').replace(/\s+/g, ' '),
        width: Math.round(box.width * 10) / 10,
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

beforeAll(async () => {
  browser = await chromium.launch();
  const page = await browser.newPage();
  for (const rail of RAILS) {
    await page.setContent(document_(rail));
    measured[rail] = await page.evaluate(probe);
  }
}, 60_000);

afterAll(async () => { await browser?.close(); });

describe('the inspector row is a Field, at sm, everywhere', () => {
  const tsx = filesIn(EDITOR, '.tsx').map((f) => [f, readFileSync(f, 'utf8')] as const);

  it('has retired the hand-rolled property label entirely', () => {
    expect(tsx.filter(([, src]) => src.includes('hud-inspect__label')).map(([f]) => f)).toEqual([]);
    const sub = tsx.filter(([, src]) => src.includes('hud-inspect__sub')).map(([f]) => f.split(/[\\/]/).pop());
    expect(sub.sort()).toEqual(['ButtonStateRow.tsx', 'CaseListEditor.tsx']);
  });

  it('routes the error and the hint through the one slot each', () => {
    const src = tsx.map(([, s]) => s).join('\n');
    expect(src).not.toContain('hud-inspect__error');
    expect(src).not.toContain('hud-expr__error');
    expect(src.match(/ error=/g)?.length).toBeGreaterThanOrEqual(2);
    expect(src.match(/ hint="/g)?.length).toBeGreaterThanOrEqual(3);
  });

  it('passes size="sm" on the control instead of leaning on the wrapper', () => {
    for (const [file, src] of tsx) {
      const controls = src.match(/<(TextInput|NumberInput|SegmentedControl|Toggle|Checkbox|ColorSwatch)\b/g) ?? [];
      if (controls.length === 0) continue;
      const sized = (src.match(/\bsize="sm"/g) ?? []).length;
      const short = `${file.split(/[\\/]/).pop()}: ${controls.length} controls`;
      expect(`${short}, ${sized >= controls.length ? 'all' : sized} sized`).toBe(`${short}, all sized`);
    }
  });

  it('spends the 2xs token instead of hand-writing it in the sheet', () => {
    const sheet = readFileSync(`${ED}/HudLayoutEditor.inspector.css`, 'utf8');
    expect((sheet.match(/--space-2xs/g) ?? []).length).toBe(9);
    expect((sheet.match(/gap: var\(--space-2xs\)/g) ?? []).length).toBe(3);
  });

  it('says align self, names the four edges, and asks min and max the same way', () => {
    const read = (f: string): string => readFileSync(`${ED}/${f}`, 'utf8');
    expect(read('sections/PlacementSection.tsx')).toContain("'align down' : 'align self'");
    expect(read('sections/PlacementSection.tsx')).toContain('label="align across"');
    expect(read('EdgesField.tsx')).toContain('label={side}');
    expect(read('BoxModelField.tsx')).toContain('`margin ${side}`');
    expect(read('MinMaxField.tsx')).toContain('Leave a field blank for no limit.');
    expect(read('MinMaxField.tsx')).not.toContain('floor/ceiling');
  });
});

describe('the adopted rows, measured at 289 / 232 / 188 px', () => {
  it('fits every SegmentedControl option set in the 188 px minimum', () => {
    const tracks = at(188, 'segmented__track', 'segments');
    expect(tracks.length).toBe(SEGMENTS.length);
    for (const t of tracks) expect(`${t.name} ${t.width <= 180}`).toBe(`${t.name} true`);
    expect(Math.max(...tracks.map((t) => t.width))).toBeLessThan(160);
  });

  it('keeps every Field label on one line, down to a quarter-width column', () => {
    for (const rail of RAILS) {
      for (const m of at(rail, 'field__label')) {
        expect(`${rail}/${m.case}/${m.name} lines ${m.lines}`).toBe(`${rail}/${m.case}/${m.name} lines 1`);
      }
    }
  });

  it('never lets an adopted row escape the rail, down to 188 px', () => {
    for (const rail of RAILS) {
      for (const m of measured[rail] ?? []) {
        expect(`${rail}/${m.case}/${m.kind}/${m.name} overflow ${m.overflow}`)
          .toBe(`${rail}/${m.case}/${m.kind}/${m.name} overflow 0`);
      }
    }
  });

  it('keeps the four border-side checkboxes on one row at 188 px', () => {
    const boxes = at(188, 'checkbox', 'sides');
    expect(boxes.length).toBe(4);
    expect(boxes.reduce((sum, b) => sum + b.width, 0) + 6).toBeLessThan(180);
  });

  it('has handed the margin edges to phase 6, which is where they became typeable', () => {
    expect(at(188, 'number-input', 'margin')).toEqual([]);
    expect(existsSync(`${ED}/EdgesInput.tsx`)).toBe(false);
    expect(existsSync(`${ED}/MinMaxExtentField.tsx`)).toBe(false);
  });

  it('shows a digit in the two-ValueField pair the compact tier was meant to unblock', () => {
    const pair = (r: number): number[] => (measured[r] ?? [])
      .filter((m) => m.case === 'pair' && m.kind === 'text-input').map((m) => m.content);
    expect(pair(289)).toEqual([99.5, 99.5]);
    expect(pair(232)).toEqual([71, 71]);
    expect(pair(188)).toEqual([49, 49]);
  });
});
