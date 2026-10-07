/* @layer tests @kind test */
import {
  describe, it, expect, vi, beforeEach, afterEach,
} from 'vitest';
import { all } from '@shared/game/data';
import { buildSchema } from '../../apps/web/src/ui/design-system/data/schema/build-schema';
import type * as TableViewModule from '../../apps/web/src/ui/design-system/composites/DataTable/behavior/use-table-view';
import type { TableColumn } from '../../apps/web/src/ui/design-system/data/table/types';

// What counts as a layout change, and proof that the table hook and the
// persisted view snapshot start from the same seed. See data-table-render.test.ts
// for why the render suite (SSR, no effects) cannot prove the latter on its own.

const screens = all('screen') as readonly Record<string, unknown>[];

let signatureOf: typeof TableViewModule.signatureOf;

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
  ({ signatureOf } = await import(
    '../../apps/web/src/ui/design-system/composites/DataTable/behavior/use-table-view'
  ));
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('the two sides start in sync, so the first render never writes', () => {
  // The SSR assertions in data-table-render.test.ts cannot prove this (effects
  // never run). What does: the table hook and the view snapshot are seeded
  // from the same column list, so the capture effect's guard is true on the
  // first pass. Asserted here directly.
  const sameSeed = async (initial: readonly TableColumn[]): Promise<boolean> => {
    const { initialState } = await import('../../apps/web/src/ui/design-system/data/table/use-data-table');
    const { emptySnapshot } = await import('../../apps/web/src/ui/design-system/data/view-state/snapshot');
    const schema = buildSchema(screens);
    const snapshotSide = { ...emptySnapshot(), columns: initial.map((column) => ({ ...column })) };
    return signatureOf(initialState(schema, initial)) === signatureOf(snapshotSide);
  };

  it('agrees on an explicit fallback column list', async () => {
    expect(await sameSeed([{ path: 'id', fit: true }, { path: 'kind', fit: true }])).toBe(true);
  });

  it('agrees on the derived default when no fallback is given', async () => {
    const { defaultColumns } = await import('../../apps/web/src/ui/design-system/data/table/use-data-table');
    expect(await sameSeed(defaultColumns(buildSchema(screens)))).toBe(true);
  });
});

describe('view signature and what counts as a layout change', () => {
  const base = { columns: [{ path: 'id' }], sort: [], groupBy: [] };

  it('ignores an identical layout, so a restore never captures straight back out', () => {
    expect(signatureOf(base)).toBe(signatureOf({ columns: [{ path: 'id' }], sort: [], groupBy: [] }));
  });

  it('counts a visual rename, a width, a sort and a grouping as changes', () => {
    expect(signatureOf({ ...base, columns: [{ path: 'id', label: 'Ref' }] })).not.toBe(signatureOf(base));
    expect(signatureOf({ ...base, columns: [{ path: 'id', width: 120 }] })).not.toBe(signatureOf(base));
    expect(signatureOf({ ...base, sort: [{ path: 'id', dir: 'asc' }] })).not.toBe(signatureOf(base));
    expect(signatureOf({ ...base, groupBy: ['kind'] })).not.toBe(signatureOf(base));
  });
});
