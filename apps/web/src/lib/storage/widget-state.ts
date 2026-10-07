/* @layer renderer-lib @kind logic */
/**
 * Repository (single boundary) for everything about a profile's widgets: the
 * layout the Widget composite writes, and the per-widget content prefs. Both
 * live in the same file (profiles/<id>/tracker.json), so one cache and one
 * debounced write serve both and neither can clobber the other.
 *
 * Whole-file semantics, the same bargain as ui-views.ts: the blob loads once per
 * profile and caches, every mutation rewrites the cached whole, and rapid writes
 * coalesce into one. What this adds is `flushWidgetBlob`, because a debounce
 * nobody forces drops whatever the user did just before the window closed.
 *
 * Before this existed, a drag wrote the whole file on every mousemove, and two
 * overlapping read-modify-writes both read the same "before", so the earlier
 * one was lost.
 */
import { loadTrackerStateBlob, saveTrackerStateBlob } from '../tracker-state-io';
import type { TrackerStateBlob } from '../tracker-state-io';
import { log } from '../log-bus';

const DEBOUNCE_MS = 250;

let cacheId: string | null = null;
let cache: TrackerStateBlob | null = null;
let loadingId: string | null = null;
let loading: Promise<TrackerStateBlob> | null = null;
let timer: ReturnType<typeof setTimeout> | null = null;
let dirty = false;
let inFlight: Promise<void> = Promise.resolve();

const writePending = (): void => {
  if (timer !== null) { clearTimeout(timer); timer = null; }
  if (!dirty || !cacheId || !cache) return;
  dirty = false;
  const [id, blob] = [cacheId, cache];
  inFlight = saveTrackerStateBlob(id, blob).catch((error: unknown) => {
    log.ipc(`Failed to save widget state for ${id}: ${String(error)}`, 'error');
  });
};

const scheduleWrite = (): void => {
  dirty = true;
  if (timer !== null) clearTimeout(timer);
  timer = setTimeout(writePending, DEBOUNCE_MS);
};

/** Forces any pending write out and resolves once it has landed. */
const flushWidgetBlob = async (): Promise<void> => {
  writePending();
  await inFlight;
};

/**
 * The profile's blob, cached. A second profile flushes the first one's pending
 * write before its own read, so switching profiles never strands an edit.
 */
const loadWidgetBlob = (profileId: string): Promise<TrackerStateBlob> => {
  if (cacheId === profileId && cache) return Promise.resolve(cache);
  if (loadingId === profileId && loading) return loading;
  loadingId = profileId;
  loading = (async () => {
    await flushWidgetBlob();
    const raw = await loadTrackerStateBlob(profileId).catch((error: unknown) => {
      log.ipc(`Failed to load widget state for ${profileId}: ${String(error)}`, 'error');
      return null;
    });
    cache = raw ?? {};
    cacheId = profileId;
    loading = null;
    loadingId = null;
    return cache;
  })();
  return loading;
};

const applyPatch = (profileId: string, patch: Partial<TrackerStateBlob>): void => {
  if (cacheId !== profileId || !cache) return;
  Object.assign(cache, patch);
  scheduleWrite();
};

/**
 * Merges keys into the cached blob and schedules one write. Patching before the
 * file is known would write a blob holding only this key, so an unloaded profile
 * reads first and patches on the way back.
 */
const patchWidgetBlob = (profileId: string, patch: Partial<TrackerStateBlob>): void => {
  if (cacheId === profileId && cache) {
    applyPatch(profileId, patch);
    return;
  }
  void loadWidgetBlob(profileId).then(() => applyPatch(profileId, patch));
};

/**
 * The persistence round-trip the bare Widget composite takes by injection. `save`
 * is fire-and-forget: it lands in the cache now and on disk once the writes stop.
 */
const widgetLayoutIO = {
  load: (profileId: string): Promise<TrackerStateBlob | null> => loadWidgetBlob(profileId),
  save: (profileId: string, blob: TrackerStateBlob): Promise<void> => {
    patchWidgetBlob(profileId, blob);
    return Promise.resolve();
  },
};

export { flushWidgetBlob, loadWidgetBlob, patchWidgetBlob, widgetLayoutIO };
