/* @layer tests @kind helper */
import { chromium } from 'playwright';
import { renderToStaticMarkup } from 'react-dom/server';
import { readFileSync } from 'fs';
import { layoutCases } from './layout-cases';
import type { LayoutRig, Measured } from './layout-widths.type';
import { cssIn } from '../files-in';
import { REPO_ROOT } from '../../repo-root';
import { EDITOR_THEME_SHEETS } from '../editor-theme-sheets.constants';

const root = REPO_ROOT;
const designSystem = `${root}/node_modules/@drizztdourden08/tessera/src`;
const editor = `${root}/apps/desktop/src/views/HudLayoutEditor/sub-components`;

const sheets = (): string[] => [
  ...cssIn(`${designSystem}/tokens`).filter((f) => !f.endsWith('index.css')),
  ...cssIn(`${designSystem}/theme`),
  `${root}/apps/desktop/src/theme.css`,
  ...cssIn(`${designSystem}/primitives`),
  ...cssIn(`${designSystem}/composites`),
  ...EDITOR_THEME_SHEETS,
  ...cssIn(editor),
];

const documentAt = (rail: number): string => {
  const body = Object.entries(layoutCases)
    .map(([id, node]) => `<section data-case="${id}"><div class="hud-inspect__group">${
      renderToStaticMarkup(node() as never)}</div></section>`)
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
    parseFloat(getComputedStyle(el).getPropertyValue(side)) || 0;
  const sel = [
    '.field__label', '.field__hint', '.hud-align', '.hud-align__row', '.hud-align__tiles',
    '.hud-align__diagram',
    '.hud-icon-choice', '.hud-grid', '.hud-grid__bar', '.hud-lattice__scroll', '.hud-lattice__cell',
    '.hud-color-field', '.text-input', '.color-swatch', '.icon-btn',
    '.hud-grid__control', '.hud-extent', '.number-input',
  ].join(', ');
  const firstClassOf = (el: Element): string => {
    const [first = ''] = el.className.split(' ');
    return first;
  };
  const textOf = (el: Element): string => {
    const text = (el as HTMLElement).innerText;
    if (text) return text;
    const label = el.getAttribute('aria-label');
    if (label) return label;
    return '?';
  };
  const out: Measured[] = [];
  for (const sec of Array.from(document.querySelectorAll('[data-case]'))) {
    const rail = sec.getBoundingClientRect();
    for (const el of Array.from(sec.querySelectorAll(sel))) {
      const box = el.getBoundingClientRect();
      const line = parseFloat(getComputedStyle(el).lineHeight) || box.height;
      out.push({
        case: (sec as HTMLElement).dataset.case ?? '?',
        kind: firstClassOf(el),
        name: textOf(el).replace(/\s+/g, ' '),
        width: Math.round(box.width * 10) / 10,
        height: Math.round(box.height * 10) / 10,
        top: Math.round((box.top - rail.top) * 10) / 10,
        content: Math.round((box.width - px(el, 'padding-left') - px(el, 'padding-right')
          - px(el, 'border-left-width') - px(el, 'border-right-width')) * 10) / 10,
        lines: Math.max(1, Math.round(box.height / line)),
        overflow: Math.max(0, Math.round(box.right - rail.right)),
        scroll: Math.max(0, el.scrollWidth - el.clientWidth),
      });
    }
  }
  return out;
};

const measureLayout = async (rails: readonly number[]): Promise<LayoutRig> => {
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
    close: () => browser.close(),
  };
};

export { measureLayout };
