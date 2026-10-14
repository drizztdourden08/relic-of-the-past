/* @layer test @kind test */
import {
  describe, it, expect, vi, beforeEach, afterEach,
} from 'vitest';
import type { Mock } from 'vitest';
import { emptySnapshot } from '@drizztdourden08/tessera/data';
import type { ViewKey, ViewSnapshot } from '@drizztdourden08/tessera/data';

let load: Mock<() => Promise<unknown>>;
let save: Mock<(entries: Record<string, unknown>) => Promise<void>>;
let wholeWrite: Mock<(map: unknown) => Promise<void>>;
let disk: Record<string, unknown>;
let loadViewSnapshot: (key: ViewKey) => Promise<ViewSnapshot | undefined>;
let saveViewSnapshot: (key: ViewKey, snapshot: ViewSnapshot) => void;

const patchDisk = (entries: Record<string, unknown>): void => {
  for (const [key, value] of Object.entries(entries)) {
    if (value === null) Reflect.deleteProperty(disk, key);
    else disk[key] = value;
  }
};

beforeEach(async () => {
  vi.resetModules();
  disk = {};
  load = vi.fn<() => Promise<unknown>>().mockImplementation(() => Promise.resolve({ ...disk }));
  save = vi.fn<(entries: Record<string, unknown>) => Promise<void>>().mockImplementation((entries) => {
    patchDisk(entries);
    return Promise.resolve();
  });
  wholeWrite = vi.fn<(map: unknown) => Promise<void>>().mockResolvedValue(undefined);
  vi.stubGlobal('window', {
    api: {
      loadUiViews: () => load(),
      patchUiViews: (entries: Record<string, unknown>) => save(entries),
      saveUiViews: (map: unknown) => wholeWrite(map),
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

  it('collapses many rapid calls, same or different keys, into one write', async () => {
    const renamed: ViewSnapshot = { ...emptySnapshot(), tab: 'json' };
    saveViewSnapshot('a:b', emptySnapshot());
    saveViewSnapshot('a:b', renamed);
    saveViewSnapshot('c:d', emptySnapshot());
    await Promise.resolve();
    await Promise.resolve();

    await vi.advanceTimersByTimeAsync(400);

    expect(save).toHaveBeenCalledTimes(1);
    expect(save).toHaveBeenCalledWith({ 'a:b': renamed, 'c:d': emptySnapshot() });
    expect(wholeWrite).not.toHaveBeenCalled();
  });

  it('merges onto the existing disk map from a cold cache, instead of clobbering it', async () => {
    disk = { 'existing:collection': emptySnapshot() };
    saveViewSnapshot('new:collection', emptySnapshot());
    await loadViewSnapshot('existing:collection');

    await vi.advanceTimersByTimeAsync(400);

    expect(save).toHaveBeenCalledWith({ 'new:collection': emptySnapshot() });
    expect(disk).toEqual({
      'existing:collection': emptySnapshot(),
      'new:collection': emptySnapshot(),
    });
  });

  it('keeps a key another writer put in the file after the load', async () => {
    await loadViewSnapshot('a:b');
    disk['app:layout'] = { zoom: 2 };
    saveViewSnapshot('a:b', emptySnapshot());

    await vi.advanceTimersByTimeAsync(400);

    expect(save).toHaveBeenCalledWith({ 'a:b': emptySnapshot() });
    expect(disk).toEqual({ 'app:layout': { zoom: 2 }, 'a:b': emptySnapshot() });
    expect(wholeWrite).not.toHaveBeenCalled();
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
