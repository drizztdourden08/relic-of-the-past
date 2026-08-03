/* @layer test @kind test */
import {
  describe, it, expect, vi, beforeEach, afterEach,
} from 'vitest';
import { emptySnapshot } from '../../apps/web/src/ui/design-system/data/view-state/snapshot';
import type { ViewKey, ViewSnapshot } from '../../apps/web/src/ui/design-system/data/view-state/snapshot';

// The repo is the single boundary the rest of the app calls through — nothing
// else touches window.api.uiViews directly. These tests cover the write
// discipline the plan calls out: debounced+coalesced, whole-file, and never
// throwing back into a caller on a failed load or save.
//
// The module keeps its cache/timer as private top-level state, so each test
// gets a clean instance via `vi.resetModules()` + a fresh dynamic import —
// that also defers evaluating log-bus's window.addEventListener side effect
// until AFTER `window` has been stubbed for this test (a static import would
// run before the stub, since imports are hoisted above everything else).

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

describe('loadViewSnapshot', () => {
  it('loads the whole map once and caches it across calls', async () => {
    load.mockResolvedValue({ 'a:b': emptySnapshot() });
    expect(await loadViewSnapshot('a:b' as ViewKey)).toEqual(emptySnapshot());
    expect(await loadViewSnapshot('a:b' as ViewKey)).toEqual(emptySnapshot());
    expect(load).toHaveBeenCalledTimes(1);
  });

  it('returns undefined for a key that is not on disk', async () => {
    expect(await loadViewSnapshot('missing:key' as ViewKey)).toBeUndefined();
  });

  it('drops a malformed entry rather than trust untyped disk JSON', async () => {
    load.mockResolvedValue({ 'a:b': { not: 'a snapshot' } });
    expect(await loadViewSnapshot('a:b' as ViewKey)).toBeUndefined();
  });

  it('never throws when the load fails, and treats it as an empty map', async () => {
    load.mockRejectedValue(new Error('disk error'));
    await expect(loadViewSnapshot('a:b' as ViewKey)).resolves.toBeUndefined();
  });
});

describe('saveViewSnapshot — debounce and coalesce', () => {
  it('does not write immediately', () => {
    saveViewSnapshot('a:b' as ViewKey, emptySnapshot());
    expect(save).not.toHaveBeenCalled();
  });

  it('collapses many rapid calls, same or different keys, into one whole-map write', async () => {
    const renamed: ViewSnapshot = { ...emptySnapshot(), tab: 'json' };
    saveViewSnapshot('a:b' as ViewKey, emptySnapshot());
    saveViewSnapshot('a:b' as ViewKey, renamed); // supersedes the first for this key
    saveViewSnapshot('c:d' as ViewKey, emptySnapshot());
    await Promise.resolve();
    await Promise.resolve();

    await vi.advanceTimersByTimeAsync(400);

    expect(save).toHaveBeenCalledTimes(1);
    expect(save).toHaveBeenCalledWith({ 'a:b': renamed, 'c:d': emptySnapshot() });
  });

  it('merges onto the existing disk map from a cold cache, instead of clobbering it', async () => {
    load.mockResolvedValue({ 'existing:collection': emptySnapshot() });
    saveViewSnapshot('new:collection' as ViewKey, emptySnapshot());
    // Awaiting a load for another key rides the same shared in-flight promise,
    // which flushes the pending cold-start mutation before this resolves.
    await loadViewSnapshot('existing:collection' as ViewKey);

    await vi.advanceTimersByTimeAsync(400);

    expect(save).toHaveBeenCalledWith({
      'existing:collection': emptySnapshot(),
      'new:collection': emptySnapshot(),
    });
  });

  it('schedules a fresh debounced write after a prior one has flushed', async () => {
    saveViewSnapshot('a:b' as ViewKey, emptySnapshot());
    await Promise.resolve();
    await vi.advanceTimersByTimeAsync(400);
    expect(save).toHaveBeenCalledTimes(1);

    saveViewSnapshot('a:b' as ViewKey, { ...emptySnapshot(), tab: 'ts' });
    await vi.advanceTimersByTimeAsync(400);
    expect(save).toHaveBeenCalledTimes(2);
  });

  it('never throws when the write fails — fire and forget', async () => {
    save.mockRejectedValue(new Error('disk full'));
    saveViewSnapshot('a:b' as ViewKey, emptySnapshot());
    await Promise.resolve();
    // Reaching this line without an unhandled rejection IS the assertion.
    await vi.advanceTimersByTimeAsync(400);
    expect(save).toHaveBeenCalledTimes(1);
  });
});
