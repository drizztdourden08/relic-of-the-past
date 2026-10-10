/* @layer tests @kind helper */
import { chromium } from 'playwright';
import { renderToStaticMarkup } from 'react-dom/server';
import { readFileSync, readdirSync } from 'fs';
import { join } from 'path';
import type { Browser } from 'playwright';
import { DESIGN_SYSTEM_DIR, EDITOR_DIR, RAILS, ROTP_THEME } from './layout-bands.constants';
import type { Measured, Rig } from './layout-bands.type';
import { layoutCases } from './layout-cases';
import { probe } from './probe';

const cssIn = (dir: string): string[] => readdirSync(dir, { withFileTypes: true })
  .flatMap((e) => (e.isDirectory() ? cssIn(join(dir, e.name)) : (e.name.endsWith('.css') ? [join(dir, e.name)] : [])));

const sheets = (): string[] => [
  ...cssIn(`${DESIGN_SYSTEM_DIR}/tokens`).filter((f) => !f.endsWith('index.css')),
  ...cssIn(`${DESIGN_SYSTEM_DIR}/theme`),
  ROTP_THEME,
  ...cssIn(`${DESIGN_SYSTEM_DIR}/primitives`),
  ...cssIn(`${DESIGN_SYSTEM_DIR}/composites`),
  ...cssIn(EDITOR_DIR),
];

const documentAt = (rail: number): string => {
  const body = Object.entries(layoutCases)
    .map(([id, node]) => `<section data-case="${id}">${renderToStaticMarkup(node() as never)}</section>`)
    .join('');
  const css = sheets().map((f) => readFileSync(f, 'utf8')).join('\n');
  return `<!doctype html><meta charset="utf-8"><style>
    html,body{margin:0;font-size:16px;font-family:system-ui}
    .rail{width:${rail}px}
    ${css}
  </style><div class="rail">${body}</div>`;
};

const measureRails = async (): Promise<Rig> => {
  const browser: Browser = await chromium.launch();
  const page = await browser.newPage();
  const measured: Record<number, Record<string, Measured>> = {};
  for (const rail of RAILS) {
    await page.setContent(documentAt(rail));
    measured[rail] = Object.fromEntries((await page.evaluate(probe)).map((m) => [m.case, m]));
  }
  return {
    at: (rail, kase) => {
      const found = measured[rail]?.[kase];
      if (!found) throw new Error(`no case ${kase} at ${rail}`);
      return found;
    },
    close: () => browser.close(),
  };
};

export { measureRails };
