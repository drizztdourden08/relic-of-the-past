/* @layer tests @kind test */
import {
  describe, it, expect, vi, beforeEach, afterEach,
} from 'vitest';
import { buildSchema, createSchemaIndex, createClause, defaultOperatorFor, beginDurableLoad, createLoadGuard, capture } from '@drizztdourden08/tessera/data';
import type { FilterClause, LoadGuard, TableState, ViewKey, ViewSnapshot, TableColumn } from '@drizztdourden08/tessera/data';

const KEY = 'data-inspector-query:screen' as ViewKey;
const OTHER_KEY = 'data-inspector-query:check' as ViewKey;
const NO_TABLE: TableState = { columns: [], sort: [], groupBy: [] };
const NO_COLUMNS: readonly TableColumn[] = [];

const ROWS = [
  { id: 'item-001', name: 'alpha' },
  { id: 'item-002', name: 'beta' },
  { id: 'item-003', name: 'gamma' },
];
const schema = createSchemaIndex(buildSchema(ROWS));

const nameField = schema.byPath('name');
if (!nameField) throw new Error('the fixture rows no longer carry a name field');

const clauseOn = (value: string): FilterClause =>
  createClause('name', defaultOperatorFor(nameField.kind), value);

const withFilters = (...filters: readonly FilterClause[]): ViewSnapshot =>
  capture(NO_TABLE, filters);

const settle = async (): Promise<void> => {
  await vi.advanceTimersByTimeAsync(0);
};

let load: ReturnType<typeof vi.fn>;
let save: ReturnType<typeof vi.fn>;
let loadViewSnapshot: (key: ViewKey) => Promise<ViewSnapshot | undefined>;
let saveViewSnapshot: (key: ViewKey, snapshot: ViewSnapshot) => void;

beforeEach(async () => {
  vi.resetModules();
  load = vi.fn().mockResolvedValue({});
  save = vi.fn().mockResolvedValue(undefined);
  vi.stubGlobal('window', {
    api: { uiViews: { load, save } },
    addEventListener: () => {},
    removeEventListener: () => {},
  });
  vi.useFakeTimers();
  ({ loadViewSnapshot, saveViewSnapshot } = await import('../../apps/web/src/lib/storage/ui-views'));
});

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

describe('load guard and which read is still allowed to land', () => {
  it('lets a read that nothing overtook apply its result', () => {
    const guard = createLoadGuard();
    expect(guard.mayApply(guard.begin())).toBe(true);
  });

  it('retires a read the moment a local write happens', () => {
    const guard = createLoadGuard();
    const token = guard.begin();
    guard.markEdited();
    expect(guard.mayApply(token)).toBe(false);
  });

  it('retires a read when the view goes away', () => {
    const guard = createLoadGuard();
    const token = guard.begin();
    guard.cancel();
    expect(guard.mayApply(token)).toBe(false);
  });

  it('retires the outgoing read when a new key starts one of its own', () => {
    const guard = createLoadGuard();
    const outgoing = guard.begin();
    const incoming = guard.begin();
    expect(guard.mayApply(outgoing)).toBe(false);
    expect(guard.mayApply(incoming)).toBe(true);
  });

  it('starts each key unwritten, so an edit under the old key never blocks the new one', () => {
    const guard = createLoadGuard();
    guard.begin();
    guard.markEdited();
    expect(guard.mayApply(guard.begin())).toBe(true);
  });
});

describe('a read that comes back late', () => {
  const mountView = (key: ViewKey) => {
    const guard: LoadGuard = createLoadGuard();
    const view = { snapshot: withFilters(), guard };
    beginDurableLoad({
      guard,
      load: () => loadViewSnapshot(key),
      schema,
      fallbackColumns: NO_COLUMNS,
      apply: (next) => { view.snapshot = next; },
    });
    return {
      view,
      setSnapshot: (next: ViewSnapshot) => {
        guard.markEdited();
        view.snapshot = next;
        saveViewSnapshot(key, next);
      },
    };
  };

  it('does not put the cleared clauses back when it lands after the last removal', async () => {
    let answer: (raw: unknown) => void = () => {};
    load.mockReturnValue(new Promise((resolve) => { answer = resolve; }));

    const { view, setSnapshot } = mountView(KEY);
    const [first, second, third] = [clauseOn('a'), clauseOn('b'), clauseOn('c')];

    setSnapshot(withFilters(first, second));
    setSnapshot(withFilters(first));
    setSnapshot(withFilters());

    answer({ [KEY]: withFilters(third) });
    await settle();

    expect(view.snapshot.filters).toEqual([]);
  });

  it('leaves the disk holding the cleared list too, not the one it answered with', async () => {
    let answer: (raw: unknown) => void = () => {};
    load.mockReturnValue(new Promise((resolve) => { answer = resolve; }));

    const { setSnapshot } = mountView(KEY);
    setSnapshot(withFilters(clauseOn('a')));
    setSnapshot(withFilters());

    answer({ [KEY]: withFilters(clauseOn('c')) });
    await settle();
    await vi.advanceTimersByTimeAsync(400);

    expect(save).toHaveBeenCalledTimes(1);
    expect(save.mock.calls[0][0][KEY].filters).toEqual([]);
  });

  it('still restores the saved clauses when the user touched nothing while it was out', async () => {
    const saved = clauseOn('a');
    let answer: (raw: unknown) => void = () => {};
    load.mockReturnValue(new Promise((resolve) => { answer = resolve; }));

    const { view } = mountView(KEY);
    answer({ [KEY]: withFilters(saved) });
    await settle();

    expect(view.snapshot.filters.map((clause) => clause.value)).toEqual(['a']);
  });
});

describe('switching collections', () => {
  it('restores the incoming key from disk even though the outgoing one was edited', async () => {
    const saved = clauseOn('kept');
    load.mockResolvedValue({ [OTHER_KEY]: withFilters(saved) });

    const guard = createLoadGuard();
    let snapshot: ViewSnapshot = withFilters();

    beginDurableLoad({
      guard, load: () => loadViewSnapshot(KEY), schema, fallbackColumns: NO_COLUMNS,
      apply: (next) => { snapshot = next; },
    });
    guard.markEdited();
    snapshot = withFilters(clauseOn('typed under the first key'));
    await settle();

    guard.cancel();
    beginDurableLoad({
      guard, load: () => loadViewSnapshot(OTHER_KEY), schema, fallbackColumns: NO_COLUMNS,
      apply: (next) => { snapshot = next; },
    });
    await settle();

    expect(snapshot.filters.map((clause) => clause.value)).toEqual(['kept']);
  });
});
