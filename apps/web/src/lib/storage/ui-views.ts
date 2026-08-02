/* @layer renderer-lib @kind logic */
/**
 * Repository (single boundary) for durable view state: keyed load/save over
 * `window.api.uiViews`, debounced and app-level rather than profile-level (see
 * shared/ipc/ui-views-contract.ts). Nothing else in the renderer touches
 * `window.api.uiViews` directly — a composite that wants persistence goes
 * through `useViewState` (design-system/data/view-state), which calls here.
 *
 * Whole-file semantics: the whole keyed map loads once and caches, every
 * mutation rewrites the whole map, and writes are fire-and-forget — a failed
 * write logs and is dropped, it never throws back into a component.
 */
import type { ViewKey, ViewSnapshot } from '@ds/data';
import { isViewSnapshot } from '@ds/data';
import { log } from '../log-bus';

const DEBOUNCE_MS = 400;

let cache: Record<string, ViewSnapshot> | null = null;
let loading: Promise<Record<string, ViewSnapshot>> | null = null;
let saveTimer: ReturnType<typeof setTimeout> | null = null;

/** Drops any entry that isn't a well-formed snapshot rather than trust untyped disk JSON. */
const sanitize = (raw: Record<string, unknown>): Record<string, ViewSnapshot> => {
  const map: Record<string, ViewSnapshot> = {};
  for (const [key, value] of Object.entries(raw)) {
    if (isViewSnapshot(value)) map[key] = value;
  }
  return map;
};

const loadAll = (): Promise<Record<string, ViewSnapshot>> => {
  if (cache) return Promise.resolve(cache);
  if (!loading) {
    loading = window.api.uiViews.load()
      .then((raw) => {
        cache = sanitize(raw as Record<string, unknown>);
        return cache;
      })
      .catch((error: unknown) => {
        log.ipc(`Failed to load ui-views.json: ${String(error)}`, 'error');
        cache = {};
        return cache;
      });
  }
  return loading;
};

const flush = (): void => {
  saveTimer = null;
  if (!cache) return;
  window.api.uiViews.save(cache).catch((error: unknown) => {
    log.ipc(`Failed to save ui-views.json: ${String(error)}`, 'error');
  });
};

const scheduleSave = (): void => {
  if (saveTimer !== null) clearTimeout(saveTimer);
  saveTimer = setTimeout(flush, DEBOUNCE_MS);
};

/** Resolves once the whole-file map has loaded, then reads this key from it. */
const loadViewSnapshot = async (key: ViewKey): Promise<ViewSnapshot | undefined> => {
  const map = await loadAll();
  return map[key];
};

const applyMutation = (key: ViewKey, snapshot: ViewSnapshot): void => {
  if (!cache) cache = {};
  cache[key] = snapshot;
  scheduleSave();
};

/**
 * Fire-and-forget, debounced and coalesced: many rapid calls for the same or
 * different keys collapse into one write of the whole map ~400ms later.
 *
 * If nothing has been loaded yet, the mutation waits on a load first — writing
 * before the disk map is known would clobber every OTHER collection's saved
 * layout with a file containing only this one key.
 */
const saveViewSnapshot = (key: ViewKey, snapshot: ViewSnapshot): void => {
  if (cache) {
    applyMutation(key, snapshot);
    return;
  }
  void loadAll().then(() => applyMutation(key, snapshot));
};

export { loadViewSnapshot, saveViewSnapshot };
