/* @layer tests @kind helper */
import { chromium } from 'playwright';
import { renderToStaticMarkup } from 'react-dom/server';
import { readFileSync } from 'fs';
import type { Browser, Page } from 'playwright';
import { DESIGN_SYSTEM_DIR, EDITOR_DIR, RAILS, ROTP_THEME } from './layout-bands.constants';
import type { Measured, Rig } from './layout-bands.type';
import { layoutCases } from './layout-cases';
import { probes } from './probes';
import { EDITOR_THEME_SHEETS } from '../editor-theme-sheets.constants';
import { cssIn } from '../files-in';
import { required } from '../../required';

const sheets = (): string[] => [
  ...cssIn(`${DESIGN_SYSTEM_DIR}/tokens`).filter((f) => !f.endsWith('index.css')),
  ...cssIn(`${DESIGN_SYSTEM_DIR}/theme`),
  ROTP_THEME,
  ...cssIn(`${DESIGN_SYSTEM_DIR}/primitives`),
  ...cssIn(`${DESIGN_SYSTEM_DIR}/composites`),
  ...EDITOR_THEME_SHEETS,
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

const readRail = async (page: Page): Promise<Measured[]> => {
  const geometry = await page.evaluate(probes.geometry);
  const tracks = await page.evaluate(probes.tracks);
  const paint = await page.evaluate(probes.paint);
  return geometry.map((g, i) => ({
    ...g, ...required(tracks[i], `the tracks of ${g.case}`), ...required(paint[i], `the paint of ${g.case}`),
  }));
};

const measureRails = async (): Promise<Rig> => {
  const browser: Browser = await chromium.launch();
  const page = await browser.newPage();
  const measured: Record<number, Record<string, Measured>> = {};
  for (const rail of RAILS) {
    await page.setContent(documentAt(rail));
    measured[rail] = Object.fromEntries((await readRail(page)).map((m) => [m.case, m]));
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
