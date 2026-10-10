/* @layer tests @kind helper */
import { chromium } from 'playwright';
import { renderToStaticMarkup } from 'react-dom/server';
import { readFileSync, readdirSync } from 'fs';
import { join } from 'path';
import { geometryCases } from './geometry-cases';
import type { GeometryRig, Measured } from './geometry-width.type';
import { REPO_ROOT } from '../../repo-root';

const root = REPO_ROOT;
const designSystem = `${root}/node_modules/@drizztdourden08/tessera/src`;
const editor = `${root}/apps/desktop/src/views/HudLayoutEditor/sub-components`;

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
  const body = Object.entries(geometryCases)
    .map(([id, node]) => `<section data-case="${id}"><div class="hud-section__body">${
      renderToStaticMarkup(node() as never)}</div></section>`)
    .join('');
  const css = sheets().map((f) => readFileSync(f, 'utf8')).join('\n');
  return `<!doctype html><meta charset="utf-8"><style>
    html,body{margin:0;font-size:16px;font-family:system-ui}
    .rail{width:${rail}px}
    ${css}
  </style><div class="rail">${body}</div>`;
};

const heightProbe = (): Record<string, number> => {
  const out: Record<string, number> = {};
  for (const sec of Array.from(document.querySelectorAll('[data-case]'))) {
    out[(sec as HTMLElement).dataset.case ?? '?'] = Math.round(sec.getBoundingClientRect().height);
  }
  return out;
};

const probe = (): Measured[] => {
  const px = (el: Element, side: string): number =>
    parseFloat((getComputedStyle(el) as unknown as Record<string, string>)[side]) || 0;
  const out: Measured[] = [];
  for (const sec of Array.from(document.querySelectorAll('[data-case]'))) {
    const rail = sec.getBoundingClientRect();
    const sel = '.field__label, .number-input, .number-input__field, .text-input, .hud-lattice__cell';
    for (const el of Array.from(sec.querySelectorAll(sel))) {
      const box = el.getBoundingClientRect();
      const line = parseFloat(getComputedStyle(el).lineHeight) || box.height;
      out.push({
        case: (sec as HTMLElement).dataset.case ?? '?',
        kind: el.className.split(' ')[0],
        name: ((el as HTMLElement).innerText || el.getAttribute('aria-label') || '?').replace(/\s+/g, ' '),
        width: Math.round(box.width * 10) / 10,
        height: Math.round(box.height * 10) / 10,
        content: Math.round((box.width - px(el, 'paddingLeft') - px(el, 'paddingRight')
          - px(el, 'borderLeftWidth') - px(el, 'borderRightWidth')) * 10) / 10,
        lines: Math.max(1, Math.round(box.height / line)),
        overflow: Math.max(0, Math.round(box.right - rail.right)),
      });
    }
  }
  return out;
};

const measureGeometry = async (rails: readonly number[]): Promise<GeometryRig> => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  const measured: Record<number, Measured[]> = {};
  const heights: Record<number, Record<string, number>> = {};
  for (const rail of rails) {
    await page.setContent(documentAt(rail));
    measured[rail] = await page.evaluate(probe);
    heights[rail] = await page.evaluate(heightProbe);
  }
  return { measured, heights, close: () => browser.close() };
};

export { measureGeometry };
