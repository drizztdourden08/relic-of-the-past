/* @layer site-kit @kind logic */
/**
 * A site's ViewStorage: the durable half of a view key over GET/PUT /me/views. One
 * record per surface, the reserved `current-<surface>` view, holds the whole snapshot;
 * the table half and the query half of a key each merge their part into it. A cache per
 * surface answers a reload at once, which is what lets an applied saved view land in the
 * table without a round trip.
 */
import { isViewSnapshot } from '@ds/data/view-state/snapshot';
import type { ViewKey, ViewSnapshot } from '@ds/data/view-state/snapshot';
import type { ViewStorage } from '@ds/data/view-state/use-view-state';
import { listViews, putView } from '../api/views-endpoints';
import type { ViewHalf, ViewKeys } from './create-view-keys';

const CURRENT_NAME = 'current';
const DEBOUNCE_MS = 400;

const mergeHalf = (base: ViewSnapshot, half: ViewHalf, next: ViewSnapshot): ViewSnapshot =>
  half === 'table'
    ? { ...base, columns: next.columns, sort: next.sort, groupBy: next.groupBy }
    : { ...base, filters: next.filters, tab: next.tab, collapsed: next.collapsed };

const createViewStorage = (keys: ViewKeys) => {
  const cache = new Map<string, ViewSnapshot>();
  const loading = new Map<string, Promise<ViewSnapshot | undefined>>();
  const timers = new Map<string, ReturnType<typeof setTimeout>>();

  const fetchCurrent = async (surface: string): Promise<ViewSnapshot | undefined> => {
    const { views } = await listViews(surface);
    const hit = views.find((view) => view.id === keys.currentViewId(surface));
    return hit && isViewSnapshot(hit.snapshot) ? hit.snapshot : undefined;
  };

  const putCurrent = (surface: string, snapshot: ViewSnapshot) =>
    putView(keys.currentViewId(surface), { surface, name: CURRENT_NAME, snapshot }).then(
      () => undefined,
      (error: unknown) => console.warn(`Saving the ${surface} view failed: ${String(error)}`),
    );

  const scheduleSave = (surface: string) => {
    const timer = timers.get(surface);
    if (timer !== undefined) clearTimeout(timer);
    timers.set(surface, setTimeout(() => {
      timers.delete(surface);
      const snapshot = cache.get(surface);
      if (snapshot) void putCurrent(surface, snapshot);
    }, DEBOUNCE_MS));
  };

  const load = (key: ViewKey): Promise<ViewSnapshot | undefined> => {
    const parsed = keys.parse(key);
    if (!parsed) return Promise.resolve(undefined);
    const { surface } = parsed;
    const cached = cache.get(surface);
    if (cached) return Promise.resolve(cached);
    let inFlight = loading.get(surface);
    if (!inFlight) {
      inFlight = fetchCurrent(surface)
        .catch(() => undefined)
        .then((loaded) => {
          loading.delete(surface);
          // A local write during the read wins; the read only fills an empty cache.
          if (loaded && !cache.has(surface)) cache.set(surface, loaded);
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

  /** The surface's live arrangement as last seen, or undefined before its first load or write. */
  const current = (surface: string): ViewSnapshot | undefined => cache.get(surface);

  /** Makes a saved view the live arrangement, at once in the cache and on the server. */
  const applyView = (surface: string, snapshot: ViewSnapshot): Promise<void> => {
    const timer = timers.get(surface);
    if (timer !== undefined) clearTimeout(timer);
    timers.delete(surface);
    cache.set(surface, snapshot);
    return putCurrent(surface, snapshot);
  };

  const storage: ViewStorage = { load, save };
  return { keys, storage, current, applyView };
};

/** One site's views: its keys, its storage and the live-arrangement helpers the hooks use. */
type SiteViews = ReturnType<typeof createViewStorage>;

export { createViewStorage };
export type { SiteViews };
