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

// useViewState is a thin composition over lib/storage/ui-views (durable) and
// stores/data-view-store (session) — see that file's own tests for the parts
// it delegates to. What matters HERE is the contract: no key means no IPC and
// no store, ever, so a composite works with zero persistence setup; a real
// key means a loaded snapshot is pruned against the current schema before a
// caller ever sees it.
//
// The module is dynamically re-imported per test (after `window` is stubbed)
// because it transitively imports lib/storage/ui-views -> log-bus, which
// touches `window.addEventListener` at module load time.

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

describe('restoreDurableSnapshot — prune on restore', () => {
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

describe('useViewState — no-key passthrough', () => {
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
    // renderToStaticMarkup never commits, so useEffect bodies never fire — the
    // no-key assertions above hold regardless of whether a key was passed, which
    // would make them vacuous if that were the only coverage. The durable load
    // path itself (an effect firing, prune-on-restore, debounce/coalesce) is
    // exercised directly in lib/storage/ui-views.test.ts and the pure
    // restoreDurableSnapshot tests above, and the load-versus-edit race in
    // view-state-load-race.test.ts; this just documents why a keyed render
    // here still shows zero calls.
    load.mockResolvedValue({ 'surface:collection': { ...emptySnapshot(), columns: [{ path: 'name' }] } });
    renderHarness('surface:collection');
    expect(load).not.toHaveBeenCalled();
  });
});
