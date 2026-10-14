/* @layer tests @kind helper */
import { chromium } from 'playwright';
import type { Page } from 'playwright';
import { renderToStaticMarkup } from 'react-dom/server';
import { readFileSync } from 'fs';
import { resolve } from 'path';
import { EDITOR_DIR, RAILS } from './metrics.constants';
import { metricsCases } from './metrics-cases';
import { probes } from './probes';
import type { Cells, MetricsRig, Read } from './metrics.type';
import { cssIn } from '../files-in';
import { REPO_ROOT } from '../../repo-root';
import { EDITOR_THEME_SHEETS } from '../editor-theme-sheets.constants';

const designSystem = resolve(REPO_ROOT, 'node_modules/@drizztdourden08/tessera/src');
const rotpTheme = resolve(REPO_ROOT, 'apps/desktop/src/theme.css');

const sheets = (): string[] => [
  ...cssIn(`${designSystem}/tokens`).filter((f) => !f.endsWith('index.css')),
  ...cssIn(`${designSystem}/theme`),
  rotpTheme,
  ...cssIn(`${designSystem}/primitives`),
  ...cssIn(`${designSystem}/composites`),
  ...EDITOR_THEME_SHEETS,
  ...cssIn(EDITOR_DIR),
];

const documentAt = (rail: number): string => {
  const body = Object.entries(metricsCases)
    .map(([id, node]) => `<section data-case="${id}"><div class="hud-section__body">${
      renderToStaticMarkup(node() as never)}</div></section>`)
    .join('');
  const css = sheets().map((f) => readFileSync(f, 'utf8')).join('\n');
  return `<!doctype html><meta charset="utf-8"><style>
    html,body{margin:0;font-size:16px;font-family:system-ui}
    .rail{width:${rail}px}
    .echo-stage{position:relative;width:398px;height:224px}
    ${css}
  </style><div class="rail">${body}</div>`;
};

const readRail = async (page: Page): Promise<Read> => {
  const { cells, paint } = await page.evaluate(probes.cells);
  const heads = await page.evaluate(probes.heads);
  const scroll = await page.evaluate(probes.scroll);
  const frozen = await page.evaluate(probes.frozen);
  const echo = await page.evaluate(probes.echo);
  return { cells, heads, scroll, paint, frozen, echo };
};

const measureMetrics = async (): Promise<MetricsRig> => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  const read: Record<number, Read> = {};
  for (const rail of RAILS) {
    await page.setContent(documentAt(rail));
    read[rail] = await readRail(page);
  }
  const cellsOf = (rail: number, kase: string): Cells[] => (read[rail]?.cells ?? []).filter((c) => c.case === kase);
  return {
    read,
    cellsOf,
    cellAt: (rail, kase, column, row) =>
      cellsOf(rail, kase).find((c) => c.column === column && c.row === row) as Cells,
    close: () => browser.close(),
  };
};

export { measureMetrics };
