/* @layer tests @kind test */
import {
  it, expect, vi, beforeEach, afterEach,
} from 'vitest';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import type * as InspectorModule from '@app/views/DataInspector';
import type * as DetailTabsModule from '@app/views/DataInspector/sub-components/DetailTabs';
import type * as SourcesModule from '@app/views/DataInspector/behavior/collection-sources';
import type * as SchemaModule from '@drizztdourden08/tessera/data';
import type { DetailTab } from '@drizztdourden08/tessera/data';
import { describeDataset } from '../dataset-guard';
import { required } from '../required';

const KINDS = ['screen', 'connection', 'check', 'item', 'dungeon', 'area', 'location', 'actor'] as const;
const TABS: readonly DetailTab[] = ['json', 'ts', 'editor'];

let DataInspector: typeof InspectorModule.DataInspector;
let DetailTabs: typeof DetailTabsModule.DetailTabs;
let COLLECTION_SOURCES: typeof SourcesModule.COLLECTION_SOURCES;
let buildSchema: typeof SchemaModule.buildSchema;

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
    '@app/views/DataInspector/behavior/collection-sources'
  ));
  ({ buildSchema } = await import('@drizztdourden08/tessera/data'));
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
  it('renders the whole screen on its default collection', () => {
    const html = renderToStaticMarkup(createElement(DataInspector));
    expect(html).toContain('data-inspector');
    expect(html).toContain('side-nav');
    expect(html).toContain('filter-bar');
    expect(html).toContain('data-table');
  });

  it('offers every collection in the side rail', () => {
    const html = renderToStaticMarkup(createElement(DataInspector));
    for (const kind of KINDS) expect(html, kind).toContain(`>${COLLECTION_SOURCES[kind].label}<`);
  });

  it('publishes what an id reference points at, for the click handler to read', () => {
    const html = renderToStaticMarkup(createElement(DataInspector));
    expect(html).toContain('data-id-ref=');
    expect(html).toContain('data-target-kind="screen"');
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
