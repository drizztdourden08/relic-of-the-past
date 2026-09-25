/* @layer tests @kind helper */
/**
 * The Layout-section measuring rig §34-§38 built, shared by the two suites that
 * read it: SSR the real components, load the real token/primitive/editor
 * stylesheets into headless Chromium, and read the boxes at 188 / 232 / 320 px.
 *
 * IT IS A FILE OF ITS OWN BECAUSE THE ASSERTIONS OUTGREW ONE (§54.5). The rig is
 * the half both suites share, so it moved instead of being squeezed.
 *
 * §55 SHRANK IT, AND THE SHRINKING IS ITSELF THE CLAIM. The composed block used
 * to have five bands: a title, a settings panel, the strip, the lattice, the
 * legend. Now it has three: the strip, the lattice, the legend. The settings are
 * not "elsewhere in the block", they are `LayoutSection`'s own two flat
 * sub-sections above it, which the `section*` cases render whole.
 *
 * THE BLOCK IS COMPOSED HERE INSTEAD OF DRIVEN, for the reason §50.9 recorded:
 * SSR renders the initial state and nothing in this harness can click. The
 * composition mirrors `GridEditor.tsx` band for band, and
 * `hud-layout-bands.keep.test.ts` greps that file to prove it still does.
 */
import { chromium } from 'playwright';
import { createElement as h } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { readFileSync, readdirSync } from 'fs';
import { join, resolve } from 'path';
import { GridLattice, occupantsOf, rowCountFor } from '../../apps/web/src/ui/domains/app/views/HudLayoutEditor/sub-components/GridLattice';
import { contextualActions, gestureActions } from '../../apps/web/src/ui/domains/app/views/HudLayoutEditor/sub-components/GridEditor/behavior/grid-actions';
import { cellStateOf } from '../../apps/web/src/ui/domains/app/views/HudLayoutEditor/sub-components/GridEditor/behavior/grid-cell-state';
import { chipOf, statusOf } from '../../apps/web/src/ui/domains/app/views/HudLayoutEditor/sub-components/GridEditor/behavior/grid-status';
import { trackExtentOf } from '../../apps/web/src/ui/domains/app/views/HudLayoutEditor/sub-components/GridEditor/behavior/grid-track-actions';
import { SelectionLegend } from '../../apps/web/src/ui/domains/app/views/HudLayoutEditor/sub-components/SelectionBands/SelectionLegend';
import { SelectionToolbar } from '../../apps/web/src/ui/domains/app/views/HudLayoutEditor/sub-components/SelectionBands/SelectionToolbar';
import { LayoutSection } from '../../apps/web/src/ui/domains/app/views/HudLayoutEditor/sub-components/sections/LayoutSection';
import { PlatformContext } from '../../apps/web/src/platform/PlatformProvider';
import type { Browser } from 'playwright';
import type { ReactNode } from 'react';
import type { Platform } from '../../shared/platform';
import type { HudContainer, HudGridContainer, HudNode } from '../../shared/types/hud';
import { probe } from './layout-bands.probe';
import type { Box, Measured } from './layout-bands.probe';
import type { GridActionContext, GridSelection } from '../../apps/web/src/ui/domains/app/views/HudLayoutEditor/sub-components/GridEditor/GridEditor.type';

const ROOT_DIR = resolve(__dirname, '../..');
const DS = `${ROOT_DIR}/apps/web/src/ui/design-system`;
const ED = `${ROOT_DIR}/apps/web/src/ui/domains/app/views/HudLayoutEditor/sub-components`;
const GRID_EDITOR_SRC = `${ED}/GridEditor/GridEditor.tsx`;
const LAYOUT_SECTION_SRC = `${ED}/sections/LayoutSection.tsx`;

const cssIn = (dir: string): string[] => readdirSync(dir, { withFileTypes: true })
  .flatMap((e) => (e.isDirectory() ? cssIn(join(dir, e.name)) : (e.name.endsWith('.css') ? [join(dir, e.name)] : [])));

const SHEETS = [
  ...cssIn(`${DS}/tokens`).filter((f) => !f.endsWith('index.css')),
  ...cssIn(`${DS}/primitives`),
  ...cssIn(`${DS}/composites`),
  ...cssIn(ED),
];

const noop = (): void => {};
const PLATFORM = { info: { os: 'windows' } } as unknown as Platform;

const leaf = (id: string, place: Record<string, number>): HudNode =>
  ({ id, kind: 'element', element: { type: 'spacer' }, size: { w: { px: 16 }, h: { px: 16 } }, place }) as unknown as HudNode;

/** The screen's own root after §42, which is the case every HUD has. */
const ROOT = (): HudGridContainer => ({
  kind: 'container', id: 'screen', layout: 'grid',
  columns: ['auto', 'fill', 'auto'], rows: ['auto', 'fill', 'auto'],
  justifyItems: 'start', alignItems: 'start',
  guide: { show: true, color: '#c064c0' },
  children: [leaf('vitals', { column: 1, row: 1 }), leaf('wallet', { column: 1, row: 3 })],
});

const FLEX: HudContainer =
  ({ kind: 'container', id: 'f', direction: 'row', children: [] }) as unknown as HudContainer;

const SELECTIONS: Readonly<Record<string, GridSelection>> = {
  none: { kind: 'none' },
  cell: { kind: 'cells', cells: [{ column: 2, row: 2 }], anchor: { column: 2, row: 2 } },
  column: { kind: 'track', axis: 'columns', indices: [1], anchor: 1 },
  row: { kind: 'track', axis: 'rows', indices: [1], anchor: 1 },
};

const ctxFor = (selection: GridSelection): GridActionContext => {
  const container = ROOT();
  return {
    container,
    selection,
    cursor: { column: 1, row: 1 },
    occupants: occupantsOf(container),
    rows: rowCountFor(container, occupantsOf(container)),
    edits: { patchContainer: noop, setSelection: noop, refuse: noop },
  };
};

/** `GridEditor.tsx`'s own bands, in its own order. Three since §55. */
const block = (selection: GridSelection): ReactNode => {
  const ctx = ctxFor(selection);
  const occupants = ctx.occupants;
  const on = (axis: 'columns' | 'rows', index: number): boolean =>
    selection.kind === 'track' && selection.axis === axis && selection.indices.includes(index);
  return h('div', { className: 'hud-grid' },
    h(SelectionToolbar, { chip: chipOf(selection), actions: contextualActions(ctx) }),
    h(GridLattice, {
      columns: ctx.container.columns, rows: ctx.container.rows, rowCount: ctx.rows,
      colSizes: [], rowSizes: [], occupants,
      cellState: (cell) => cellStateOf(selection, occupants, cell),
      trackOn: on,
      extentOf: (axis, index) => trackExtentOf(ctx.container, axis, index),
      cursor: { column: 1, row: 1 },
      label: 'grid', onCellDown: noop, onCellEnter: noop, onPointerUp: noop, onKeyDown: noop,
      onTrackDown: noop, onAddTrack: noop, onSizeTrack: noop,
    }),
    h(SelectionLegend, {
      actions: [...contextualActions(ctx), ...gestureActions(ctx)],
      os: 'windows',
      status: statusOf({
        selection, occupants, columns: ctx.container.columns.length, rows: ctx.rows,
      }),
      refusal: null,
    }),
  );
};

const CASES: Record<string, () => ReactNode> = {
  sectionGrid: () => h(PlatformContext.Provider, { value: PLATFORM },
    h(LayoutSection, { node: ROOT() as unknown as HudContainer, onPatch: noop, scope: {} })),
  sectionFlex: () => h(PlatformContext.Provider, { value: PLATFORM },
    h(LayoutSection, { node: FLEX, onPatch: noop, scope: {} })),
  ...Object.fromEntries(Object.entries(SELECTIONS).map(([name, sel]) =>
    [`state-${name}`, () => block(sel)])),
};

const document_ = (rail: number): string => {
  const body = Object.entries(CASES)
    .map(([id, node]) => `<section data-case="${id}">${renderToStaticMarkup(node() as never)}</section>`)
    .join('');
  const css = SHEETS.map((f) => readFileSync(f, 'utf8')).join('\n');
  return `<!doctype html><meta charset="utf-8"><style>
    html,body{margin:0;font-size:16px;font-family:system-ui}
    .rail{width:${rail}px}
    ${css}
  </style><div class="rail">${body}</div>`;
};

const RAILS = [220, 232, 320];

/** One row of the toolbar: a 26px floor plus its own 2px padding and 1px border,
 *  both sides. It is the number every "is it one row" claim compares to. */
// A 26px button, 2px of padding above and below. It was 32 while the strip wore
// `.hud-toolbar`'s border; the strip is flat now (§55.1) - one more box inside a
// section was the nesting the maintainer asked to stop - so the 2px of border
// went with it. The GUARANTEE is unchanged: one row, the same in every state.
const ONE_ROW = 26 + 2 * 2;

interface Rig {
  at: (rail: number, kase: string) => Measured;
  close: () => Promise<void>;
}

const measureRails = async (): Promise<Rig> => {
  const browser: Browser = await chromium.launch();
  const page = await browser.newPage();
  const measured: Record<number, Record<string, Measured>> = {};
  for (const rail of RAILS) {
    await page.setContent(document_(rail));
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

export {
  CASES, GRID_EDITOR_SRC, LAYOUT_SECTION_SRC, ONE_ROW, RAILS, SELECTIONS, measureRails,
};
export type { Box, Measured, Rig };
