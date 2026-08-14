/* @layer tests @kind test */
import {
  describe, it, expect, vi, beforeEach, afterEach,
} from 'vitest';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import type * as InspectorModule from '../../apps/web/src/ui/domains/app/views/DataInspector';
import type * as DetailTabsModule from '../../apps/web/src/ui/domains/app/views/DataInspector/sub-components/DetailTabs';
import type * as SourcesModule from '../../apps/web/src/ui/domains/app/views/DataInspector/behavior/collection-sources';
import type * as SchemaModule from '../../apps/web/src/ui/design-system/data/schema/build-schema';
import type { DetailTab } from '../../apps/web/src/ui/design-system/data/view-state/snapshot';
import { describeDataset } from '../dataset-guard';

// There is no jsdom here, so these are SSR smoke tests. The screen's active
// collection is React state, and SSR cannot drive state, so "each of the eight
// kinds" is covered where the kind actually varies: the detail panel is
// rendered once per collection against that collection's own source, schema and
// first record, on each of the three tabs. The screen itself is rendered whole
// on its default collection.
//
// What they CANNOT cover, and what is therefore unverified in this pass:
// clicking a row, clicking an id reference (the delegated capture handler),
// switching collection in the side rail, and anything portalled.

const KINDS = ['screen', 'connection', 'check', 'item', 'dungeon', 'area', 'location', 'actor'] as const;
const TABS: readonly DetailTab[] = ['json', 'ts', 'editor'];

let DataInspector: typeof InspectorModule.DataInspector;
let DetailTabs: typeof DetailTabsModule.DetailTabs;
let COLLECTION_SOURCES: typeof SourcesModule.COLLECTION_SOURCES;
let buildSchema: typeof SchemaModule.buildSchema;

beforeEach(async () => {
  vi.resetModules();
  // The view-state binding reaches lib/storage -> log-bus, which touches
  // window at module load, so the stub has to precede the import.
  vi.stubGlobal('window', {
    api: { uiViews: { load: vi.fn().mockResolvedValue({}), save: vi.fn().mockResolvedValue(undefined) } },
    addEventListener: () => {},
    removeEventListener: () => {},
    matchMedia: () => ({ matches: false, addEventListener: () => {}, removeEventListener: () => {} }),
  });
  ({ DataInspector } = await import('../../apps/web/src/ui/domains/app/views/DataInspector'));
  ({ DetailTabs } = await import(
    '../../apps/web/src/ui/domains/app/views/DataInspector/sub-components/DetailTabs'
  ));
  ({ COLLECTION_SOURCES } = await import(
    '../../apps/web/src/ui/domains/app/views/DataInspector/behavior/collection-sources'
  ));
  ({ buildSchema } = await import('../../apps/web/src/ui/design-system/data/schema/build-schema'));
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
    expect(html).toContain('nav-rail');
    expect(html).toContain('filter-bar');
    expect(html).toContain('data-table');
  });

  it('offers every collection in the side rail', () => {
    const html = renderToStaticMarkup(createElement(DataInspector));
    for (const kind of KINDS) expect(html, kind).toContain(`>${COLLECTION_SOURCES[kind].label}<`);
  });

  // The delegated handler reads these two attributes off the clicked element,
  // so their presence in the markup is the half of that contract a renderless
  // test can check. The click itself needs a DOM and is not covered here.
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
      const id = COLLECTION_SOURCES[kind].getId(COLLECTION_SOURCES[kind].rows[0]);
      expect(renderDetail(kind, 'json'), kind).toContain(id);
      expect(renderDetail(kind, 'ts'), kind).toContain(id);
    }
  });

  // Every collection is writable now, so the note this used to look for has
  // nowhere left to appear. What is still worth pinning is the other half of
  // the same rule: a collection with a write path must not be told it has none.
  it('never claims a writable collection cannot save', () => {
    const NOTE = 'No write path is wired';
    for (const kind of KINDS) {
      expect(COLLECTION_SOURCES[kind].onSave, `${kind} has no write path`).toBeDefined();
      expect(renderDetail(kind, 'editor'), kind).not.toContain(NOTE);
    }
  });

  it('renders a placeholder rather than a form when nothing is selected', () => {
    const html = renderDetail('screen', 'editor', false);
    expect(html).toContain('data-inspector__empty');
    expect(html).not.toContain('record-editor');
  });
});
