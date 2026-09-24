/* @layer sanctuary-site @kind logic */
/**
 * The site's ViewStorage: the durable half of a view key over GET/PUT /me/views. One
 * record per surface, the reserved `current-<surface>` view, holds the whole snapshot;
 * the table half and the query half of a key each merge their part into it. A cache per
 * surface answers a reload at once, which is what lets an applied saved view land in the
 * table without a round trip.
 */
import type { ViewSurface } from '@shared/sanctuary/types';
import { isViewSnapshot } from '@ds/data/view-state/snapshot';
import type { ViewKey, ViewSnapshot } from '@ds/data/view-state/snapshot';
import type { ViewStorage } from '@ds/data/view-state/use-view-state';
import { listViews, putView } from '../api/views-endpoints';
import { currentViewId, parseViewKey } from './view-keys';
import type { ViewHalf } from './view-keys';

const CURRENT_NAME = 'current';
const DEBOUNCE_MS = 400;

const cache = new Map<ViewSurface, ViewSnapshot>();
const loading = new Map<ViewSurface, Promise<ViewSnapshot | undefined>>();
const timers = new Map<ViewSurface, ReturnType<typeof setTimeout>>();

const mergeHalf = (base: ViewSnapshot, half: ViewHalf, next: ViewSnapshot): ViewSnapshot =>
  half === 'table'
    ? { ...base, columns: next.columns, sort: next.sort, groupBy: next.groupBy }
    : { ...base, filters: next.filters, tab: next.tab, collapsed: next.collapsed };

const fetchCurrent = async (surface: ViewSurface): Promise<ViewSnapshot | undefined> => {
  const { views } = await listViews(surface);
  const hit = views.find((view) => view.id === currentViewId(surface));
  return hit && isViewSnapshot(hit.snapshot) ? hit.snapshot : undefined;
};

const putCurrent = (surface: ViewSurface, snapshot: ViewSnapshot) =>
  putView(currentViewId(surface), { surface, name: CURRENT_NAME, snapshot }).then(
    () => undefined,
    (error: unknown) => console.warn(`Saving the ${surface} view failed: ${String(error)}`),
  );

const scheduleSave = (surface: ViewSurface) => {
  const timer = timers.get(surface);
  if (timer !== undefined) clearTimeout(timer);
  timers.set(surface, setTimeout(() => {
    timers.delete(surface);
    const snapshot = cache.get(surface);
    if (snapshot) void putCurrent(surface, snapshot);
  }, DEBOUNCE_MS));
};

const load = (key: ViewKey): Promise<ViewSnapshot | undefined> => {
  const parsed = parseViewKey(key);
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
  const parsed = parseViewKey(key);
  if (!parsed) return;
  const { surface, half } = parsed;
  cache.set(surface, mergeHalf(cache.get(surface) ?? snapshot, half, snapshot));
  scheduleSave(surface);
};

/** The surface's live arrangement as last seen, or undefined before its first load or write. */
const current = (surface: ViewSurface): ViewSnapshot | undefined => cache.get(surface);

/** Makes a saved view the live arrangement, at once in the cache and on the server. */
const applyView = (surface: ViewSurface, snapshot: ViewSnapshot): Promise<void> => {
  const timer = timers.get(surface);
  if (timer !== undefined) clearTimeout(timer);
  timers.delete(surface);
  cache.set(surface, snapshot);
  return putCurrent(surface, snapshot);
};

const sanctuaryViewStorage: ViewStorage = { load, save };

export { sanctuaryViewStorage, current, applyView };
