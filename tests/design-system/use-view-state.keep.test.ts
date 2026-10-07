/* @layer tests @kind test */
import {
  describe, it, expect, vi, beforeEach, afterEach,
} from 'vitest';
import * as React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { buildSchema, createSchemaIndex } from '../../apps/web/src/ui/design-system/data/schema/build-schema';
import { restoreDurableSnapshot } from '../../apps/web/src/ui/design-system/data/view-state/durable-load';
import { emptySnapshot } from '../../apps/web/src/ui/design-system/data/view-state/snapshot';
import type { ViewSnapshot } from '../../apps/web/src/ui/design-system/data/view-state/snapshot';
import type { UseViewStateResult } from '../../apps/web/src/ui/design-system/data/view-state/use-view-state';
import type * as UseViewStateModule from '../../apps/web/src/ui/design-system/data/view-state/use-view-state';
import type { TableColumn } from '../../apps/web/src/ui/design-system/data/table/types';

// useViewState composes lib/storage/ui-views (durable) and
// stores/data-view-store (session). The contract HERE: no key means no IPC and
// no store, ever; a real key means a loaded snapshot is pruned against the
// current schema before a caller sees it.
//
// Re-imported per test after `window` is stubbed: ui-views -> log-bus touches
// `window.addEventListener` at module load.

const ROWS = [
  { id: 'item-001', name: 'alpha' },
  { id: 'item-002', name: 'beta' },
];
const schema = createSchemaIndex(buildSchema(ROWS));

let load: ReturnType<typeof vi.fn>;
let save: ReturnType<typeof vi.fn>;
let useViewState: typeof UseViewStateModule.useViewState;

beforeEach(async () => {
  vi.resetModules();
  load = vi.fn().mockResolvedValue({});
  save = vi.fn().mockResolvedValue(undefined);
  vi.stubGlobal('window', {
    api: { uiViews: { load, save } },
    addEventListener: () => {},
    removeEventListener: () => {},
  });
  ({ useViewState } = await import(
    '../../apps/web/src/ui/design-system/data/view-state/use-view-state'
  ));
});

afterEach(() => {
  vi.unstubAllGlobals();
});

const idColumn: readonly TableColumn[] = [{ path: 'id', fit: true }];
const idNameColumns: readonly TableColumn[] = [{ path: 'id', fit: true }, { path: 'name', fit: true }];

describe('restoreDurableSnapshot prunes on restore', () => {
  it('prunes a loaded snapshot against the current schema', () => {
    const stale: ViewSnapshot = { ...emptySnapshot(), columns: [{ path: 'id' }, { path: 'gone' }] };
    expect(restoreDurableSnapshot(stale, schema, idColumn).columns.map((c) => c.path)).toEqual(['id']);
  });

  it('falls back to the given columns when nothing was loaded at all', () => {
    expect(restoreDurableSnapshot(undefined, schema, idNameColumns).columns.map((c) => c.path))
      .toEqual(['id', 'name']);
  });

  it('falls back when the loaded snapshot pruned to nothing', () => {
    const stale: ViewSnapshot = { ...emptySnapshot(), columns: [{ path: 'gone' }] };
    expect(restoreDurableSnapshot(stale, schema, idColumn).columns.map((c) => c.path)).toEqual(['id']);
  });

  it('leaves a snapshot that still fits entirely alone', () => {
    const fresh: ViewSnapshot = { ...emptySnapshot(), columns: [{ path: 'name' }], tab: 'editor' };
    expect(restoreDurableSnapshot(fresh, schema, idColumn)).toEqual(fresh);
  });
});

describe('useViewState no-key passthrough', () => {
  const renderHarness = (key: Parameters<typeof useViewState>[0]): UseViewStateResult => {
    let captured: UseViewStateResult | undefined;
    const Harness = (): null => {
      captured = useViewState(key, schema, idNameColumns);
      return null;
    };
    renderToStaticMarkup(React.createElement(Harness));
    if (!captured) throw new Error('useViewState did not run');
    return captured;
  };

  it('seeds a purely in-memory snapshot from the fallback columns when there is no key', () => {
    const result = renderHarness(undefined);
    expect(result.snapshot.columns.map((c) => c.path)).toEqual(['id', 'name']);
    expect(result.snapshot.sort).toEqual([]);
    expect(result.sessionView).toEqual({ scrollTop: 0, expanded: [], selectedId: null });
  });

  it('never calls window.api to load when there is no key', () => {
    renderHarness(undefined);
    expect(load).not.toHaveBeenCalled();
  });

  it('setSnapshot and setSessionView never reach window.api or the session store when there is no key', () => {
    const result = renderHarness(undefined);
    result.setSnapshot({ ...emptySnapshot(), columns: [{ path: 'name' }] });
    result.setSessionView({ scrollTop: 40, expanded: ['g1'], selectedId: 'item-002' });

    expect(load).not.toHaveBeenCalled();
    expect(save).not.toHaveBeenCalled();
  });

  it('is silent by construction, not by luck: a real key would load via an effect SSR never runs', async () => {
    // renderToStaticMarkup never commits, so effects never fire and the no-key
    // assertions above hold regardless of key. The durable load path is covered
    // in lib/storage/ui-views.test.ts and view-state-load-race.test.ts; this
    // only documents why a keyed render shows zero calls.
    load.mockResolvedValue({ 'surface:collection': { ...emptySnapshot(), columns: [{ path: 'name' }] } });
    renderHarness('surface:collection');
    expect(load).not.toHaveBeenCalled();
  });
});
