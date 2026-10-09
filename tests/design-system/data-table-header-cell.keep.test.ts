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

const screens = all('screen') as readonly Record<string, unknown>[];

let HeaderCell: typeof HeaderCellModule.HeaderCell;

beforeEach(async () => {
  vi.resetModules();
  const load = vi.fn().mockResolvedValue({});
  const save = vi.fn().mockResolvedValue(undefined);
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

describeDataset('HeaderCell label, caret and handles', () => {
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
    expect(markup).toContain('draggable="false"');
  });

  it('publishes which column it is, so a fit-to-content can measure it', () => {
    expect(renderHeaderCell()).toContain('data-column-head="kind"');
    expect(renderHeaderCell()).toContain('data-column-label');
  });

  it('shows the direction it sorts, and nothing about its rank', () => {
    expect(renderHeaderCell({ sortDir: 'desc' })).toContain('▾');
    expect(renderHeaderCell({ sortDir: 'asc' })).toContain('▴');
    expect(renderHeaderCell()).toContain('↕');
  });

  it('carries neither a sort-rank badge nor a grouping flag any more', () => {
    expect(renderHeaderCell({ sortDir: 'asc' })).not.toContain('data-table__sort-rank');
    expect(renderHeaderCell({ grouped: true })).not.toContain('data-table__header-flag');
    expect(renderHeaderCell({ grouped: true })).not.toContain('▦');
  });

  it('always renders both controls, so the reveal is opacity instead of presence', () => {
    const markup = renderHeaderCell();
    expect(markup).toContain('data-table__sort');
    expect(markup).toContain('data-table__menu-trigger');
  });

  it('holds both controls in one overlay cluster, outside the label\'s flow', () => {
    const markup = renderHeaderCell();
    expect(markup).toContain('data-table__header-chrome');
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
    expect(renderHeaderCell()).toContain('data-table__caret--off');
  });

  it('renders no menu until it is opened, and wears no open marker', () => {
    expect(renderHeaderCell()).not.toContain('dropdown-menu');
    expect(renderHeaderCell()).not.toContain('data-table__header-cell--menu-open');
  });
});
