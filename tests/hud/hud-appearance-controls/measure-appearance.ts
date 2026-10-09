/* @layer tests @kind helper */
import { chromium } from 'playwright';
import { renderToStaticMarkup } from 'react-dom/server';
import { readFileSync, readdirSync } from 'fs';
import { join, resolve } from 'path';
import { appearanceCases } from './appearance-cases';
import type { AppearanceRig, Measured } from './appearance.type';

const root = resolve(__dirname, '../../..');
const designSystem = `${root}/node_modules/@drizztdourden08/tessera/src`;
const editor = `${root}/apps/desktop/src/ui/domains/app/views/HudLayoutEditor/sub-components`;

const cssIn = (dir: string): string[] => readdirSync(dir, { withFileTypes: true })
  .flatMap((e) => (e.isDirectory() ? cssIn(join(dir, e.name)) : (e.name.endsWith('.css') ? [join(dir, e.name)] : [])));

const sheets = (): string[] => [
  ...cssIn(`${designSystem}/tokens`).filter((f) => !f.endsWith('index.css')),
  ...cssIn(`${designSystem}/theme`),
  `${root}/apps/desktop/src/theme.css`,
  ...cssIn(`${designSystem}/primitives`),
  ...cssIn(`${designSystem}/composites`),
  ...cssIn(editor),
];

const documentAt = (rail: number): string => {
  const body = Object.entries(appearanceCases)
    .map(([id, node]) => `<section data-case="${id}">${renderToStaticMarkup(node() as never)}</section>`)
    .join('');
  const css = sheets().map((f) => readFileSync(f, 'utf8')).join('\n');
  return `<!doctype html><meta charset="utf-8"><style>
    html,body{margin:0;font-size:16px;font-family:system-ui}
    .rail{width:${rail}px}
    ${css}
  </style><div class="rail">${body}</div>`;
};

const probe = (): Measured[] => {
  const px = (el: Element, side: string): number =>
    parseFloat((getComputedStyle(el) as unknown as Record<string, string>)[side]) || 0;
  const sel = [
    '.hud-inspect__group', '.hud-subgroup', '.hud-subgroup__head', '.hud-subgroup__summary',
    '.hud-subgroup__swatch', '.hud-sides', '.hud-ramp__track', '.hud-slot-chips',
    '.hud-color-field', '.text-input', '.field__label', '.field__hint', '.hud-icon-choice',
  ].join(', ');
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

const measureAppearance = async (rails: readonly number[]): Promise<AppearanceRig> => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  const measured: Record<number, Measured[]> = {};
  for (const rail of rails) {
    await page.setContent(documentAt(rail));
    measured[rail] = await page.evaluate(probe);
  }
  return {
    measured,
    at: (rail, kind, kase) =>
      (measured[rail] ?? []).filter((m) => m.kind === kind && (kase === undefined || m.case === kase)),
    hex: (rail, kase, label) => {
      const hit = (measured[rail] ?? [])
        .find((m) => m.case === kase && m.kind === 'text-input' && m.name === `${label} hex`);
      if (!hit) throw new Error(`no ColorField "${label}" in ${kase} at ${rail}px`);
      return hit.content;
    },
    close: () => browser.close(),
  };
};

export { measureAppearance };
