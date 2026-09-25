/* @layer tests @kind test */
/**
 * Phase 3 of `plans/hud-inspector-ux-review.html` covers finding F3, "a design system
 * with a `Field`, and a panel that never uses it". Two halves, because the claim
 * has two halves.
 *
 * THE SOURCE HALF is cheap and total: no file under `HudLayoutEditor/` may put a
 * property label in anything but a `Field`, and the inspector stylesheet may not
 * grow back the `--space-2xs` rules that phase 2's `SpaceToken` addition retired.
 * Both are grep-shaped, so both hold for every row, not just the measured ones.
 *
 * THE LAYOUT HALF reuses phase 1's harness (`hud-inspector-collapsed-fields`):
 * SSR the real components, load the real stylesheets into headless Chromium, and
 * MEASURE at 289 / 232 / 188 px, which are the default rail, the width every wireframe on
 * that page is drawn at, and the 220 px minimum. It exists because `sm` had never
 * been on screen anywhere: phase 2 shipped the tier with no call site, and this is
 * the pass that gives it one. The specific unknown it was asked to close is
 * whether `SegmentedControl` at `sm` fits its options in 188 px. It does. The
 * widest option set in the panel (`none | loop | ping-pong`) is a 155.1 px track,
 * with 25 px to spare. The narrowest, `123 | ƒx`, was 66.3 and is GONE: phase 4
 * deleted the mode switch, so that option set no longer exists anywhere.
 */
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { chromium, type Browser } from 'playwright';
import { createElement as h } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { existsSync, readFileSync, readdirSync } from 'fs';
import { join, resolve } from 'path';
import { EdgesField } from '../../apps/web/src/ui/domains/app/views/HudLayoutEditor/sub-components/EdgesField';
import { ValueField } from '../../apps/web/src/ui/domains/app/views/HudLayoutEditor/sub-components/ValueField';
import { Field } from '../../apps/web/src/ui/design-system/primitives/Field';
import { SegmentedControl } from '../../apps/web/src/ui/design-system/primitives/SegmentedControl';

const ROOT = resolve(__dirname, '../..');
const DS = `${ROOT}/apps/web/src/ui/design-system`;
const EDITOR = `${ROOT}/apps/web/src/ui/domains/app/views/HudLayoutEditor`;
const ED = `${EDITOR}/sub-components`;

const filesIn = (dir: string, ext: string): string[] => readdirSync(dir, { withFileTypes: true })
  .flatMap((e) => (e.isDirectory() ? filesIn(join(dir, e.name), ext) : (e.name.endsWith(ext) ? [join(dir, e.name)] : [])));

// tokens/index.css is only a list of @imports, which setContent will not resolve.
const SHEETS = [
  ...filesIn(`${DS}/tokens`, '.css').filter((f) => !f.endsWith('index.css')),
  ...filesIn(`${DS}/primitives`, '.css'),
  // Walked, not listed: phase 4 added `ValueInput/ValueInput.css` in a folder
  // of its own, and an explicit list silently measures an unstyled control.
  ...filesIn(ED, '.css'),
];

const noop = (): void => {};
const scope = { life_current: 8 };
const seg = (...labels: string[]) => labels.map((label) => ({ value: label, label }));

/**
 * Every `SegmentedControl` option set the panel renders, at `sm`. The track is
 * `flex-shrink: 0`, so its width does not depend on the rail. One measurement
 * answers all three widths, and 180 px (a full row at the 188 px minimum) is
 * the number to beat.
 */
const SEGMENTS: readonly (readonly string[])[] = [
  ['flex', 'grid'], ['uniform', 'per corner'], ['none', 'loop', 'ping-pong'],
  ['game sprite', 'font'], ['fixed position', 'slot'], ['text', 'ƒx'], ['glyph', 'image'],
  ['verb', 'slot'],
];

// `EdgesInput` (margin) and `MinMaxExtentField` (min) were measured here until
// phase 6 replaced them with `BoxModelField` and `MinMaxField` and deleted both;
// `ExtentInput` (w/h) followed once §48 removed its last caller. Their successors
// are measured in `hud-inspector-geometry-width`, against the numbers this file
// recorded for them (§35.6).
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
        // The typing surface: the box less its own padding and border.
        content: Math.round((box.width - px(el, 'paddingLeft') - px(el, 'paddingRight')
          - px(el, 'borderLeftWidth') - px(el, 'borderRightWidth')) * 10) / 10,
        // A label that wrapped is a label that did not fit its column.
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
    // `.hud-inspect__label` was the group heading (Margin, Padding, min, max,
    // States); `.hud-inspect__sub` was the per-property label. Both are the
    // `Field` label now. Two CARD headings survive, one for a switch
    // case's number and one for a button state's name. They title a bordered card
    // instead of naming a control, so they are not property rows.
    expect(tsx.filter(([, src]) => src.includes('hud-inspect__label')).map(([f]) => f)).toEqual([]);
    const sub = tsx.filter(([, src]) => src.includes('hud-inspect__sub')).map(([f]) => f.split(/[\\/]/).pop());
    expect(sub.sort()).toEqual(['ButtonStateRow.tsx', 'CaseListEditor.tsx']);
  });

  it('routes the error and the hint through the one slot each', () => {
    const src = tsx.map(([, s]) => s).join('\n');
    // Identity's duplicate-id rule and ExpressionInput's parse error were two
    // hand-rolled spans (`.hud-inspect__error`, `.hud-expr__error`); the prose
    // under a slot number and a glyph source were loose `Text` lines.
    expect(src).not.toContain('hud-inspect__error');
    expect(src).not.toContain('hud-expr__error');
    expect(src.match(/ error=/g)?.length).toBeGreaterThanOrEqual(2);
    expect(src.match(/ hint="/g)?.length).toBeGreaterThanOrEqual(3);
  });

  it('passes size="sm" on the control instead of leaning on the wrapper', () => {
    // Contract §32.3: `Field` deliberately does NOT write the shared `--ctl-*`
    // variables, so a compact row only exists if every control in it asks.
    for (const [file, src] of tsx) {
      const controls = src.match(/<(TextInput|NumberInput|SegmentedControl|Toggle|Checkbox|ColorSwatch)\b/g) ?? [];
      if (controls.length === 0) continue;
      const sized = (src.match(/\bsize="sm"/g) ?? []).length;
      const short = `${file.split(/[\\/]/).pop()}: ${controls.length} controls`;
      expect(`${short}, ${sized >= controls.length ? 'all' : sized} sized`).toBe(`${short}, all sized`);
    }
  });

  it('spends the 2xs token instead of hand-writing it in the sheet', () => {
    // 21 before this pass (contract §32.1), 10 after it. What is left is what a
    // primitive cannot express: six paddings, one gap on a Button, and gaps on
    // elements that carry a popover `ref`. `Flex` forwards none, so they stay
    // `Box`. See contract §35.3.
    //
    // 10 → 9 in phase 9 (§40): a button state's face is a `ReferenceField`
    // now, so `.hud-button-state__face` has no markup left to lay out and its
    // gap went with it. Down is the direction this count is supposed to move.
    const sheet = readFileSync(`${ED}/HudLayoutEditor.inspector.css`, 'utf8');
    expect((sheet.match(/--space-2xs/g) ?? []).length).toBe(9);
    expect((sheet.match(/gap: var\(--space-2xs\)/g) ?? []).length).toBe(3);
  });

  it('says align self, names the four edges, and asks min and max the same way', () => {
    const read = (f: string): string => readFileSync(`${ED}/${f}`, 'utf8');
    // §42.4's ternary is back (§50): the self-alignment pair belongs to the
    // CHILD, so it lives in the child's own section again, with one axis under a
    // flex parent, both under a grid one.
    expect(read('sections/PlacementSection.tsx')).toContain("'align down' : 'align self'");
    expect(read('sections/PlacementSection.tsx')).toContain('label="align across"');
    expect(read('EdgesField.tsx')).toContain('label={side}');
    // The four edges are named on the box model now, one ring each; the two
    // min/max sentences ("no floor/ceiling set" on w, "no limit set" on h, in
    // one group) are one hint on one group.
    expect(read('BoxModelField.tsx')).toContain('`margin ${side}`');
    expect(read('MinMaxField.tsx')).toContain('Leave a field blank for no limit.');
    expect(read('MinMaxField.tsx')).not.toContain('floor/ceiling');
  });
});

describe('the adopted rows, measured at 289 / 232 / 188 px', () => {
  it('fits every SegmentedControl option set in the 188 px minimum', () => {
    // The one thing phase 2 shipped unverified (contract §32.6). The track is
    // `flex-shrink: 0`, so an option set that does not fit pushes its row wide
    // instead of wrapping. Widest is `none | loop | ping-pong` at 155.1 px;
    // then `uniform | per corner` 129.6, `fixed position | slot` 124.4,
    // `game sprite | font` 117.8, `glyph | image` 97, `verb | slot` 78.2,
    // `flex | grid` 76.2, `text | ƒx` 68.9, `123 | ƒx` 66.3.
    const tracks = at(188, 'segmented__track', 'segments');
    expect(tracks.length).toBe(SEGMENTS.length);
    for (const t of tracks) expect(`${t.name} ${t.width <= 180}`).toBe(`${t.name} true`);
    expect(Math.max(...tracks.map((t) => t.width))).toBeLessThan(160);
  });

  it('keeps every Field label on one line, down to a quarter-width column', () => {
    // `bottom` in a 42 px edge column is the tightest of them, and the reason
    // the plan's "t r b l -> edge names" was measured before it was written.
    for (const rail of RAILS) {
      for (const m of at(rail, 'field__label')) {
        expect(`${rail}/${m.case}/${m.name} lines ${m.lines}`).toBe(`${rail}/${m.case}/${m.name} lines 1`);
      }
    }
  });

  it('never lets an adopted row escape the rail, down to 188 px', () => {
    // The min/max row DID escape it by 75 px when the axis first became an
    // inline Field: `.field--inline .field__control` had `flex: 1` and no
    // `min-width: 0`, so the control kept its min-content floor. Fixed in
    // Field.css, and this is the assertion that found it.
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
    // What this row measured: four numeric columns in one row, 28.3 / 14.0 /
    // 3.0 px of typing surface, and "no arrangement of four spinners fits
    // 188 px". `BoxModelField` is that arrangement's replacement and it is
    // measured in `hud-inspector-geometry-width`, which asserts every one of
    // the same four edges is over 18 px at the minimum rail. What is pinned
    // here is only that the row this file used to render is gone for good.
    expect(at(188, 'number-input', 'margin')).toEqual([]);
    expect(existsSync(`${ED}/EdgesInput.tsx`)).toBe(false);
    expect(existsSync(`${ED}/MinMaxExtentField.tsx`)).toBe(false);
  });

  it('shows a digit in the two-ValueField pair the compact tier was meant to unblock', () => {
    // Contract §34.4: "Two Animation duration/delay ValueFields share 281 px,
    // so each gets 138.5. 138.5 < 141.3. Zero, before and after." That was the
    // md tier's arithmetic (86 px mode switch + 55 px input chrome). At `sm` it
    // is 66.3 + ~39, and the same row measured 31.2 px of digits at the default
    // rail, which fits "300" but was still 0 at 188. PHASE 4 deleted the switch
    // outright, worth another 68.3 px per field, and the pair is now typeable
    // at every rail including the 188 px minimum. GridTemplateEditor's
    // `gap x`/`gap y` is the identical shape and the pair F1 photographs; it
    // measures the same three numbers.
    const pair = (r: number): number[] => (measured[r] ?? [])
      .filter((m) => m.case === 'pair' && m.kind === 'text-input').map((m) => m.content);
    expect(pair(289)).toEqual([99.5, 99.5]);
    expect(pair(232)).toEqual([71, 71]);
    expect(pair(188)).toEqual([49, 49]);
  });
});
