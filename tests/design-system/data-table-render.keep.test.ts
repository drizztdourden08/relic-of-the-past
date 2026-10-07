/* @layer tests @kind test */
import {
  describe, it, expect, vi, beforeEach, afterEach,
} from 'vitest';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { all } from '@shared/game/data';
import { buildSchema } from '../../apps/web/src/ui/design-system/data/schema/build-schema';
import type * as DataTableModule from '../../apps/web/src/ui/design-system/composites/DataTable';
import { describeDataset } from '../dataset-guard';

// SSR smoke tests (no jsdom): real collections render, a keyless table is
// silent. Drag and drop, carets, actions and the portalled ⋯ / + menus need a
// live DOM. HeaderCell, GroupRow, the footer and view-signature each have
// their own file.

const screens = all('screen') as readonly Record<string, unknown>[];
const connections = all('connection') as readonly Record<string, unknown>[];
const getRowId = (row: Record<string, unknown>): string => String(row.id);

let load: ReturnType<typeof vi.fn>;
let save: ReturnType<typeof vi.fn>;
let DataTable: typeof DataTableModule.DataTable;

beforeEach(async () => {
  vi.resetModules();
  load = vi.fn().mockResolvedValue({});
  save = vi.fn().mockResolvedValue(undefined);
  // The view-state binding reaches lib/storage -> log-bus, which touches
  // window at module load, so the stub has to precede the import.
  vi.stubGlobal('window', {
    api: { uiViews: { load, save } },
    addEventListener: () => {},
    removeEventListener: () => {},
  });
  ({ DataTable } = await import('../../apps/web/src/ui/design-system/composites/DataTable'));
});

afterEach(() => {
  vi.unstubAllGlobals();
});

const renderTable = (
  rows: readonly Record<string, unknown>[],
  extra: Record<string, unknown> = {},
): string =>
  renderToStaticMarkup(createElement(DataTable, {
    rows, schema: buildSchema(rows), getRowId, ...extra,
  }));

describeDataset('DataTable renders real collections', () => {
  it('renders a screen collection with a header and a row per record', () => {
    const markup = renderTable(screens);
    expect(markup).toContain('data-table__header');
    expect(markup.match(/data-table__row/g)).toHaveLength(screens.length);
  });

  it('renders the wide collection too, where a lot of columns is the point', () => {
    const markup = renderTable(connections);
    expect(markup).toContain('data-table__header-cell');
    expect(markup).toContain(String(connections[0].id));
  });

  it('shows only the fallback columns when it is given some', () => {
    const markup = renderTable(screens, { fallbackColumns: [{ path: 'id' }, { path: 'kind' }] });
    // Two columns plus the trailing cell, which now holds nothing.
    expect(markup.match(/data-table__header-cell(?!--trailing)/g)).toHaveLength(3);
    expect(markup).toContain('data-table__header-cell--trailing');
  });

  it('offers no standalone + any more, because adding a column is a menu entry now', () => {
    const markup = renderTable(screens, { fallbackColumns: [{ path: 'id' }, { path: 'kind' }] });
    expect(markup).not.toContain('data-table__add');
    expect(markup).not.toContain('aria-label="Add column"');
  });

  it('draws a boundary line at every column\'s trailing edge, not only under the cursor', () => {
    // The seam element carries the line; its resting colour is what makes the
    // boundary permanent, and there is exactly one per real column.
    const markup = renderTable(screens, { fallbackColumns: [{ path: 'id' }, { path: 'kind' }] });
    expect(markup.match(/data-table__resize/g)).toHaveLength(2);
  });

  it('marks the selected record', () => {
    const markup = renderTable(screens, { selectedId: getRowId(screens[0]) });
    expect(markup).toContain('data-table__row--selected');
  });

  it('says so instead of rendering an empty grid when there is nothing to show', () => {
    const markup = renderToStaticMarkup(createElement(DataTable, {
      rows: [], schema: buildSchema(screens), getRowId, emptyMessage: 'No records.',
    }));
    expect(markup).toContain('No records.');
  });

  it('never reaches storage without a view key', () => {
    renderTable(screens, { fallbackColumns: [{ path: 'id' }] });
    expect(load).not.toHaveBeenCalled();
    expect(save).not.toHaveBeenCalled();
  });

  it('parks a ghost per header carrying real values out of that column', () => {
    const markup = renderTable(screens, { fallbackColumns: [{ path: 'id' }] });
    // One strip per column, each holding a capped sample and owning the rest.
    expect(markup.match(/data-table__drag-ghost"/g)).toHaveLength(1);
    expect(markup).toContain(getRowId(screens[0]));
    expect(markup).toContain(`+${screens.length - 6} more`);
  });

  it('counts its own rows in a footer, instead of leaving that to the caller', () => {
    const markup = renderTable(screens);
    expect(markup).toContain('data-table__footer');
    expect(markup).toContain(`${screens.length} entries`);
  });

  it('says entry, singular, when there is one of them', () => {
    expect(renderTable(screens.slice(0, 1))).toContain('1 entry');
  });

  it('takes the caller\'s own noun for a row when "entry" is the wrong word', () => {
    expect(renderTable(screens.slice(0, 1), { countLabel: ['screen', 'screens'] })).toContain('1 screen');
  });

  it('offers the table-wide actions once in that footer, never once per column', () => {
    const markup = renderTable(screens, { fallbackColumns: [{ path: 'id' }, { path: 'kind' }] });
    expect(markup.match(/data-table__options/g)).toHaveLength(1);
    expect(markup).toContain('aria-label="Table options"');
  });

  it('still counts, and still offers its options, with nothing to show', () => {
    const markup = renderToStaticMarkup(createElement(DataTable, {
      rows: [], schema: buildSchema(screens), getRowId, emptyMessage: 'No records.',
    }));
    expect(markup).toContain('0 entries');
    expect(markup).toContain('data-table__options');
  });

  it('renders a nested field path as a column of its own', () => {
    const markup = renderTable(connections, { fallbackColumns: [{ path: 'id' }, { path: 'placement.side' }] });
    expect(markup).toContain('Side');
  });

  it('publishes one track list for the whole grid, with nothing measured yet', () => {
    // Nothing has been laid out on the server, so no column can be falling back
    // to its content width. Every one is on the track its own state asks for.
    const markup = renderTable(screens, { fallbackColumns: [{ path: 'id' }, { path: 'kind' }] });
    expect(markup).toContain('--dt-tracks');
    expect(markup).not.toContain('1fr 1fr');
  });
});
