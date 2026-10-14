/* @layer site-kit @kind logic */
import type { ViewKey, ViewSnapshot, ViewStorage } from '@drizztdourden08/tessera/data';
import { DEBOUNCE_MS } from './create-view-storage.constants';
import { fetchCurrentView } from './fetch-current-view';
import { putCurrentView } from './put-current-view';
import type { ViewHalf, ViewKeys } from './create-view-keys.type';

const mergeHalf = (base: ViewSnapshot, half: ViewHalf, next: ViewSnapshot): ViewSnapshot =>
  half === 'table'
    ? { ...base, columns: next.columns, sort: next.sort, groupBy: next.groupBy }
    : { ...base, filters: next.filters, tab: next.tab, collapsed: next.collapsed };

const createViewStorage = (keys: ViewKeys) => {
  const cache = new Map<string, ViewSnapshot>();
  const loading = new Map<string, Promise<ViewSnapshot | undefined>>();
  const timers = new Map<string, ReturnType<typeof setTimeout>>();

  const scheduleSave = (surface: string) => {
    const timer = timers.get(surface);
    if (timer !== undefined) clearTimeout(timer);
    timers.set(surface, setTimeout(() => {
      timers.delete(surface);
      const snapshot = cache.get(surface);
      if (snapshot) void putCurrentView(keys, surface, snapshot);
    }, DEBOUNCE_MS));
  };

  const fillIfEmpty = (surface: string, loaded: ViewSnapshot | undefined) => {
    if (loaded && !cache.has(surface)) cache.set(surface, loaded);
  };

  const load = (key: ViewKey): Promise<ViewSnapshot | undefined> => {
    const parsed = keys.parse(key);
    if (!parsed) return Promise.resolve(undefined);
    const { surface } = parsed;
    const cached = cache.get(surface);
    if (cached) return Promise.resolve(cached);
    let inFlight = loading.get(surface);
    if (!inFlight) {
      inFlight = fetchCurrentView(keys, surface)
        .catch(() => undefined)
        .then((loaded) => {
          loading.delete(surface);
          fillIfEmpty(surface, loaded);
          return cache.get(surface);
        });
      loading.set(surface, inFlight);
    }
    return inFlight;
  };

  const save = (key: ViewKey, snapshot: ViewSnapshot): void => {
    const parsed = keys.parse(key);
    if (!parsed) return;
    const { surface, half } = parsed;
    cache.set(surface, mergeHalf(cache.get(surface) ?? snapshot, half, snapshot));
    scheduleSave(surface);
  };

  const current = (surface: string): ViewSnapshot | undefined => cache.get(surface);

  const applyView = (surface: string, snapshot: ViewSnapshot): Promise<void> => {
    const timer = timers.get(surface);
    if (timer !== undefined) clearTimeout(timer);
    timers.delete(surface);
    cache.set(surface, snapshot);
    return putCurrentView(keys, surface, snapshot);
  };

  const storage: ViewStorage = { load, save };
  return { keys, storage, current, applyView };
};

export { createViewStorage };
export type { SiteViews } from './create-view-storage.type';
