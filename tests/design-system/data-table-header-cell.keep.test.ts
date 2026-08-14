/* @layer tests @kind test */
import {
  describe, it, expect, vi, beforeEach, afterEach,
} from 'vitest';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { all } from '@shared/game/data';
import { buildSchema, createSchemaIndex } from '../../apps/web/src/ui/design-system/data/schema/build-schema';
import type * as HeaderCellModule from '../../apps/web/src/ui/design-system/composites/DataTable/sub-components/HeaderCell';
import type {
  ColumnActions, ColumnDragBinding,
} from '../../apps/web/src/ui/design-system/composites/DataTable/DataTable.type';
import { describeDataset } from '../dataset-guard';

// SSR smoke tests for one column header — its label, sort caret, ⋯ trigger and
// resize seam. See data-table-render.test.ts for why these are SSR-only (no
// live DOM, so no drag/drop and no menu actually opening).

const screens = all('screen') as readonly Record<string, unknown>[];

let HeaderCell: typeof HeaderCellModule.HeaderCell;

beforeEach(async () => {
  vi.resetModules();
  const load = vi.fn().mockResolvedValue({});
  const save = vi.fn().mockResolvedValue(undefined);
  // The view-state binding reaches lib/storage -> log-bus, which touches
  // window at module load, so the stub has to precede the import.
  vi.stubGlobal('window', {
    api: { uiViews: { load, save } },
    addEventListener: () => {},
    removeEventListener: () => {},
  });
  ({ HeaderCell } = await import(
    '../../apps/web/src/ui/design-system/composites/DataTable/sub-components/HeaderCell'
  ));
});

afterEach(() => {
  vi.unstubAllGlobals();
});

const DRAG: ColumnDragBinding = {
  draggingPath: null, draggingIndex: null, overIndex: null,
  onDragStart: () => {}, onDragOver: () => {}, onDrop: () => {}, onDragEnd: () => {},
};

const NO_ACTIONS: ColumnActions = {
  onToggleSort: () => {}, onSortDir: () => {}, onRemoveSort: () => {}, onAddColumnAt: () => {},
  onRemove: () => {}, onMove: () => {}, onRename: () => {}, onGroupBy: () => {}, onUngroup: () => {},
  onResize: () => {}, onPreviewResize: () => {}, onFitToContent: () => {}, onExpandToFill: () => {},
  onSetDisplayField: () => {},
};

const renderHeaderCell = (extra: Record<string, unknown> = {}): string => {
  const schema = createSchemaIndex(buildSchema(screens));
  return renderToStaticMarkup(createElement(HeaderCell, {
    column: { path: 'kind' }, field: schema.byPath('kind'), index: 1, columnCount: 3,
    grouped: false, actions: NO_ACTIONS, drag: DRAG,
    ghostRows: [], rowTotal: 0, ...extra,
  }));
};

describeDataset('HeaderCell — label, caret and handles', () => {
  it('falls back to the field label and offers both controls', () => {
    const markup = renderHeaderCell();
    expect(markup).toContain('Kind');
    expect(markup).toContain('Sort by Kind');
    expect(markup).toContain('Column options for Kind');
  });

  it('prefers a visual rename over the field label without touching the path', () => {
    const markup = renderHeaderCell({ column: { path: 'kind', label: 'Sort of' } });
    expect(markup).toContain('Sort of');
    expect(markup).toContain('title="kind"');
  });

  it('is draggable, which is how a column is reordered', () => {
    expect(renderHeaderCell()).toContain('draggable="true"');
  });

  it('carries a seam on its trailing edge, which is how it is resized', () => {
    const markup = renderHeaderCell();
    expect(markup).toContain('data-table__resize');
    expect(markup).toContain('aria-label="Resize Kind"');
    // The seam must never be picked up as the column — that is the other gesture.
    expect(markup).toContain('draggable="false"');
  });

  it('publishes which column it is, so a fit-to-content can measure it', () => {
    expect(renderHeaderCell()).toContain('data-column-head="kind"');
    expect(renderHeaderCell()).toContain('data-column-label');
  });

  it('shows the direction it sorts, and nothing about its rank', () => {
    // The SMALL triangles: a sorted caret is permanent and now sits ON the
    // label, so its width is label the reader cannot see.
    expect(renderHeaderCell({ sortDir: 'desc' })).toContain('▾');
    expect(renderHeaderCell({ sortDir: 'asc' })).toContain('▴');
    expect(renderHeaderCell()).toContain('↕');
  });

  /*
   * The rank badge and the grouping flag were both unreadable at header size
   * and both charged the label for the space. They are one read-only sentence
   * about the whole table now, in the footer — asserted as text in
   * data-table-sort-group-summary.test.ts.
   */
  it('carries neither a sort-rank badge nor a grouping flag any more', () => {
    expect(renderHeaderCell({ sortDir: 'asc' })).not.toContain('data-table__sort-rank');
    expect(renderHeaderCell({ grouped: true })).not.toContain('data-table__header-flag');
    expect(renderHeaderCell({ grouped: true })).not.toContain('▦');
  });

  /*
   * The reveal itself is CSS and needs a cursor, which this suite has not got.
   * What CAN be proved here is the hook the stylesheet hangs off: both controls
   * are always in the markup (so they stay focusable and nothing reflows), and
   * a sorted column marks itself as the one whose caret stays visible at rest.
   */
  it('always renders both controls, so the reveal is opacity rather than presence', () => {
    const markup = renderHeaderCell();
    expect(markup).toContain('data-table__sort');
    expect(markup).toContain('data-table__menu-trigger');
  });

  /*
   * Both controls are one absolutely-positioned cluster, so they overlay the
   * name instead of taking width off it — the label's own track is the whole
   * cell and the ellipsis answers to that alone.
   */
  it('holds both controls in one overlay cluster, outside the label\'s flow', () => {
    const markup = renderHeaderCell();
    expect(markup).toContain('data-table__header-chrome');
    // The label is rendered BEFORE the cluster, which is what puts it under.
    expect(markup.indexOf('data-table__header-label'))
      .toBeLessThan(markup.indexOf('data-table__header-chrome'));
  });

  it('marks a sorted column so its caret and their backing stay showing at rest', () => {
    expect(renderHeaderCell({ sortDir: 'asc' })).toContain('data-table__header-cell--sorted');
    expect(renderHeaderCell({ sortDir: 'desc' })).toContain('data-table__header-cell--sorted');
    expect(renderHeaderCell()).not.toContain('data-table__header-cell--sorted');
  });

  it('carries the caret in its own fixed box, which is what caps its width', () => {
    expect(renderHeaderCell({ sortDir: 'asc' })).toContain('data-table__caret');
    // Unsorted, the glyph is dimmed as well as hidden until hover.
    expect(renderHeaderCell()).toContain('data-table__caret--off');
  });

  it('renders no menu until it is opened, and wears no open marker', () => {
    expect(renderHeaderCell()).not.toContain('dropdown-menu');
    expect(renderHeaderCell()).not.toContain('data-table__header-cell--menu-open');
  });
});
