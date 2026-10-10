/* @layer test @kind test */
import {
  describe, it, expect, vi, beforeEach, afterEach,
} from 'vitest';
import type { Mock } from 'vitest';
import { emptySnapshot } from '@drizztdourden08/tessera/data';
import type { ViewKey, ViewSnapshot } from '@drizztdourden08/tessera/data';

let load: Mock<() => Promise<unknown>>;
let save: Mock<(map: unknown) => Promise<void>>;
let loadViewSnapshot: (key: ViewKey) => Promise<ViewSnapshot | undefined>;
let saveViewSnapshot: (key: ViewKey, snapshot: ViewSnapshot) => void;

beforeEach(async () => {
  vi.resetModules();
  load = vi.fn<() => Promise<unknown>>().mockResolvedValue({});
  save = vi.fn<(map: unknown) => Promise<void>>().mockResolvedValue(undefined);
  vi.stubGlobal('window', {
    api: {
      fileReadText: async (path: string) => (path === 'config/data-views.json' ? JSON.stringify(await load()) : null),
      fileWriteText: (path: string, text: string) => (path === 'config/data-views.json' ? save(JSON.parse(text)) : Promise.resolve()),
    },
    addEventListener: () => {},
    removeEventListener: () => {},
  });
  vi.useFakeTimers();
  ({ loadViewSnapshot, saveViewSnapshot } = await import('@app/storage/ui-views'));
});

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

describe('loadViewSnapshot', () => {
  it('loads the whole map once and caches it across calls', async () => {
    load.mockResolvedValue({ 'a:b': emptySnapshot() });
    expect(await loadViewSnapshot('a:b')).toEqual(emptySnapshot());
    expect(await loadViewSnapshot('a:b')).toEqual(emptySnapshot());
    expect(load).toHaveBeenCalledTimes(1);
  });

  it('returns undefined for a key that is not on disk', async () => {
    expect(await loadViewSnapshot('missing:key')).toBeUndefined();
  });

  it('drops a malformed entry instead of trusting untyped disk JSON', async () => {
    load.mockResolvedValue({ 'a:b': { not: 'a snapshot' } });
    expect(await loadViewSnapshot('a:b')).toBeUndefined();
  });

  it('never throws when the load fails, and treats it as an empty map', async () => {
    load.mockRejectedValue(new Error('disk error'));
    await expect(loadViewSnapshot('a:b')).resolves.toBeUndefined();
  });
});

describe('saveViewSnapshot debounces and coalesces', () => {
  it('does not write immediately', () => {
    saveViewSnapshot('a:b', emptySnapshot());
    expect(save).not.toHaveBeenCalled();
  });

  it('collapses many rapid calls, same or different keys, into one whole-map write', async () => {
    const renamed: ViewSnapshot = { ...emptySnapshot(), tab: 'json' };
    saveViewSnapshot('a:b', emptySnapshot());
    saveViewSnapshot('a:b', renamed);
    saveViewSnapshot('c:d', emptySnapshot());
    await Promise.resolve();
    await Promise.resolve();

    await vi.advanceTimersByTimeAsync(400);

    expect(save).toHaveBeenCalledTimes(1);
    expect(save).toHaveBeenCalledWith({ 'a:b': renamed, 'c:d': emptySnapshot() });
  });

  it('merges onto the existing disk map from a cold cache, instead of clobbering it', async () => {
    load.mockResolvedValue({ 'existing:collection': emptySnapshot() });
    saveViewSnapshot('new:collection', emptySnapshot());
    await loadViewSnapshot('existing:collection');

    await vi.advanceTimersByTimeAsync(400);

    expect(save).toHaveBeenCalledWith({
      'existing:collection': emptySnapshot(),
      'new:collection': emptySnapshot(),
    });
  });

  it('schedules a fresh debounced write after a prior one has flushed', async () => {
    saveViewSnapshot('a:b', emptySnapshot());
    await Promise.resolve();
    await vi.advanceTimersByTimeAsync(400);
    expect(save).toHaveBeenCalledTimes(1);

    saveViewSnapshot('a:b', { ...emptySnapshot(), tab: 'ts' });
    await vi.advanceTimersByTimeAsync(400);
    expect(save).toHaveBeenCalledTimes(2);
  });

  it('never throws when the write fails, because it is fire and forget', async () => {
    save.mockRejectedValue(new Error('disk full'));
    saveViewSnapshot('a:b', emptySnapshot());
    await Promise.resolve();
    await vi.advanceTimersByTimeAsync(400);
    expect(save).toHaveBeenCalledTimes(1);
  });
});
