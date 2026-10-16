/* @layer tests @kind test */
import {
  it, expect, vi, beforeEach, afterEach,
} from 'vitest';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import type * as InspectorModule from '@app/views/DataInspector';
import type * as DetailTabsModule from '@app/views/DataInspector/sub-components/DetailTabs';
import type * as SourcesModule from '@app/data-inspector/collection-sources';
import type * as SchemaModule from '@drizztdourden08/tessera/data';
import type * as ListModule from '@app/views/DataInspector/sub-components/InspectorList';
import type * as KindDataModule from '@app/views/DataInspector/behavior/kind-data';
import type * as WindowedModule from '@app/views/DataInspector/behavior/windowed-rows';
import type { DetailTab } from '@drizztdourden08/tessera/data';
import { describeDataset } from '../dataset-guard';
import { required } from '../required';

const KINDS = ['screen', 'connection', 'check', 'item', 'dungeon', 'area', 'location', 'actor'] as const;
const TABS: readonly DetailTab[] = ['json', 'ts', 'editor'];

let DataInspector: typeof InspectorModule.DataInspector;
let DetailTabs: typeof DetailTabsModule.DetailTabs;
let COLLECTION_SOURCES: typeof SourcesModule.COLLECTION_SOURCES;
let buildSchema: typeof SchemaModule.buildSchema;
let InspectorList: typeof ListModule.InspectorList;
let loadKindData: typeof KindDataModule.loadKindData;
let peekKindData: typeof KindDataModule.peekKindData;
let orderedRows: typeof WindowedModule.orderedRows;
let reachFor: typeof WindowedModule.reachFor;

beforeEach(async () => {
  vi.resetModules();
  vi.stubGlobal('window', {
    api: { uiViews: { load: vi.fn().mockResolvedValue({}), save: vi.fn().mockResolvedValue(undefined) } },
    addEventListener: () => {},
    removeEventListener: () => {},
    matchMedia: () => ({ matches: false, addEventListener: () => {}, removeEventListener: () => {} }),
  });
  ({ DataInspector } = await import('@app/views/DataInspector'));
  ({ DetailTabs } = await import(
    '@app/views/DataInspector/sub-components/DetailTabs'
  ));
  ({ COLLECTION_SOURCES } = await import(
    '@app/data-inspector/collection-sources'
  ));
  ({ buildSchema } = await import('@drizztdourden08/tessera/data'));
  ({ InspectorList } = await import('@app/views/DataInspector/sub-components/InspectorList'));
  ({ loadKindData, peekKindData } = await import('@app/views/DataInspector/behavior/kind-data'));
  ({ orderedRows, reachFor } = await import('@app/views/DataInspector/behavior/windowed-rows'));
});

afterEach(() => {
  vi.unstubAllGlobals();
});

const renderDetail = (kind: (typeof KINDS)[number], tab: DetailTab, withRecord = true): string => {
  const source = COLLECTION_SOURCES[kind];
  return renderToStaticMarkup(createElement(DetailTabs, {
    source,
    schema: buildSchema(source.rows, source.config),
    record: withRecord ? source.rows[0] : undefined,
    tab,
    onTabChange: () => {},
  }));
};

describeDataset('DataInspector', () => {
  it('opens on a loading state and builds no table before the collection is loaded', () => {
    expect(peekKindData('screen')).toBeUndefined();
    const html = renderToStaticMarkup(createElement(DataInspector));
    expect(html).toContain('data-inspector__loading');
    expect(html).toContain('role="status"');
    expect(html).not.toContain('data-table');
    expect(html).toContain('side-nav');
  });

  it('renders the whole screen on its default collection once it is loaded', () => {
    loadKindData('screen');
    const html = renderToStaticMarkup(createElement(DataInspector));
    expect(html).toContain('data-inspector');
    expect(html).toContain('side-nav');
    expect(html).toContain('filter-bar');
    expect(html).toContain('data-table');
  });

  it('offers every collection in the side rail', () => {
    loadKindData('screen');
    const html = renderToStaticMarkup(createElement(DataInspector));
    for (const kind of KINDS) expect(html, kind).toContain(`>${COLLECTION_SOURCES[kind].label}<`);
  });

  it('publishes what an id reference points at, for the click handler to read', () => {
    loadKindData('screen');
    const html = renderToStaticMarkup(createElement(DataInspector));
    expect(html).toContain('data-id-ref=');
    expect(html).toContain('data-target-kind="screen"');
  });
});

describeDataset('DataInspector row window', () => {
  it('keeps a collection loaded once and hands back the same data', () => {
    expect(peekKindData('item')).toBeUndefined();
    const first = loadKindData('item');
    expect(loadKindData('item')).toBe(first);
    expect(peekKindData('item')).toBe(first);
  });

  it('draws only the first page of a large collection, and every row of a small one', () => {
    const draw = (kind: 'connection' | 'dungeon'): { html: string; total: number } => {
      const { source, schema } = loadKindData(kind);
      const html = renderToStaticMarkup(createElement(InspectorList, {
        kind, loading: false, source, schema, rows: source.rows, clauses: [], onClausesChange: () => {},
        search: '', onSearchChange: () => {}, selectedId: null, onSelect: () => {},
      }));
      return { html, total: source.rows.length };
    };
    const rowsIn = (html: string): number => html.match(/class="data-table__row"/g)?.length ?? 0;

    const large = draw('connection');
    expect(large.total).toBeGreaterThan(100);
    expect(rowsIn(large.html)).toBe(100);
    expect(large.html).toContain(`Showing 100 of ${large.total}`);

    const small = draw('dungeon');
    expect(rowsIn(small.html)).toBe(small.total);
    expect(small.html).not.toContain('Showing');
  });

  it('orders before it cuts, so a sorted page is the top of the whole collection', () => {
    const { source, schema } = loadKindData('screen');
    const order = (dir: 'asc' | 'desc') => orderedRows(source.rows, schema, { sort: [{ path: 'id', dir }], groupBy: [] });
    const ascending = order('asc');
    const descending = order('desc');
    expect(descending).toHaveLength(source.rows.length);
    expect(source.getId(required(descending[0], 'a sorted row')))
      .toBe(source.getId(required(ascending[ascending.length - 1], 'a sorted row')));
    expect(orderedRows(source.rows, schema, { sort: [], groupBy: [] })).toBe(source.rows);
  });

  it('reaches far enough to include the selected row', () => {
    const { source } = loadKindData('screen');
    const target = source.getId(required(source.rows[250], 'a screen row'));
    expect(reachFor(source.rows, target, source.getId)).toBe(251);
    expect(reachFor(source.rows, null, source.getId)).toBe(0);
  });
});

describeDataset('DataInspector detail panel', () => {
  it('renders every collection on every tab', () => {
    for (const kind of KINDS) {
      for (const tab of TABS) {
        expect(renderDetail(kind, tab).length, `${kind}/${tab}`).toBeGreaterThan(0);
      }
    }
  });

  it('shows the record as JSON and as the source text a save would write', () => {
    for (const kind of KINDS) {
      const id = COLLECTION_SOURCES[kind].getId(required(COLLECTION_SOURCES[kind].rows[0], `a ${kind} row`));
      expect(renderDetail(kind, 'json'), kind).toContain(id);
      expect(renderDetail(kind, 'ts'), kind).toContain(id);
    }
  });

  it('never claims a writable collection cannot save', () => {
    const NOTE = 'No write path is wired';
    for (const kind of KINDS) {
      expect(COLLECTION_SOURCES[kind].onSave, `${kind} has no write path`).toBeDefined();
      expect(renderDetail(kind, 'editor'), kind).not.toContain(NOTE);
    }
  });

  it('renders a placeholder instead of a form when nothing is selected', () => {
    const html = renderDetail('screen', 'editor', false);
    expect(html).toContain('data-inspector__empty');
    expect(html).not.toContain('record-editor');
  });
});
