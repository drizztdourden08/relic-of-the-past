/* @layer tests @kind helper */
import { chromium } from 'playwright';
import { renderToStaticMarkup } from 'react-dom/server';
import { readFileSync, readdirSync } from 'fs';
import { join, resolve } from 'path';
import { EDITOR_DIR, RAILS } from './metrics.constants';
import { metricsCases } from './metrics-cases';
import type { Cells, Frozen, Heads, MetricsRig, Read, Scroller } from './metrics.type';

const designSystem = resolve(__dirname, '../../../apps/web/src/ui/design-system');

const cssIn = (dir: string): string[] => readdirSync(dir, { withFileTypes: true })
  .flatMap((e) => (e.isDirectory() ? cssIn(join(dir, e.name)) : (e.name.endsWith('.css') ? [join(dir, e.name)] : [])));

const sheets = (): string[] => [
  ...cssIn(`${designSystem}/tokens`).filter((f) => !f.endsWith('index.css')),
  ...cssIn(`${designSystem}/primitives`),
  ...cssIn(`${designSystem}/composites`),
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

const probe = (): Read => {
  const round = (n: number): number => Math.round(n * 10) / 10;
  const cells: Cells[] = [];
  const heads: Heads[] = [];
  const scroll: Scroller[] = [];
  const paint: Record<string, string> = {};
  for (const sec of Array.from(document.querySelectorAll('[data-case]'))) {
    const name = (sec as HTMLElement).dataset.case ?? '?';
    for (const el of Array.from(sec.querySelectorAll('.hud-lattice__cell'))) {
      const box = el.getBoundingClientRect();
      const data = (el as HTMLElement).dataset;
      cells.push({
        case: name, column: Number(data.column), row: Number(data.row),
        x: round(box.x), y: round(box.y), width: round(box.width), height: round(box.height),
      });
      const state = data.state ?? '?';
      const css = getComputedStyle(el);
      if (!paint[state]) paint[state] = `${css.backgroundColor} | ${css.backgroundImage}`;
    }
    for (const el of Array.from(sec.querySelectorAll('.hud-lattice__head'))) {
      const box = el.getBoundingClientRect();
      const label = el.getAttribute('aria-label') ?? '';
      heads.push({
        case: name, axis: label.startsWith('column') ? 'columns' : 'rows',
        index: Number(label.split(' ')[1]), empty: (el as HTMLElement).dataset.empty === 'true',
        x: round(box.x), y: round(box.y), width: round(box.width), height: round(box.height),
      });
    }
    for (const el of Array.from(sec.querySelectorAll('.hud-lattice__scroll'))) {
      scroll.push({
        case: name, scrollW: el.scrollWidth, clientW: el.clientWidth, scrollH: el.scrollHeight, clientH: el.clientHeight,
      });
    }
  }

  const port = document.querySelector('[data-case="twelve"] .hud-lattice__scroll');
  const frozenNow = (): Frozen => {
    const view = port?.getBoundingClientRect();
    const rowHead = port?.querySelector('.hud-lattice__head--row')?.getBoundingClientRect();
    const colHead = port?.querySelector('.hud-lattice__head:not(.hud-lattice__head--row)')?.getBoundingClientRect();
    const sticky = getComputedStyle(port?.querySelector('.hud-lattice__head--row') as Element).position;
    return {
      rowHeadOffset: round((rowHead?.left ?? 0) - (view?.left ?? 0)),
      colHeadOffset: round((colHead?.top ?? 0) - (view?.top ?? 0)),
      sticky,
    };
  };
  const before = frozenNow();
  if (port) { port.scrollLeft = 120; port.scrollTop = 60; }
  const after = frozenNow();

  const echoBox = document.querySelector('[data-case="echo"] .hud-grid-echo')?.getBoundingClientRect();
  const stage = document.querySelector('.echo-stage')?.getBoundingClientRect();
  const echo = echoBox && stage
    ? {
      x: round(echoBox.left - stage.left), y: round(echoBox.top - stage.top),
      w: round(echoBox.width), h: round(echoBox.height),
    }
    : null;
  return { cells, heads, scroll, paint, frozen: { before, after }, echo };
};

const measureMetrics = async (): Promise<MetricsRig> => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  const read: Record<number, Read> = {};
  for (const rail of RAILS) {
    await page.setContent(documentAt(rail));
    read[rail] = await page.evaluate(probe);
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
