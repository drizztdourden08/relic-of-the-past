/* @layer renderer-lib @kind logic */
import { saveTrackerStateBlob } from '../../tracker-state-io';
import { log } from '../../log-bus';
import { widgetBlobCache } from './widget-blob-cache';

const writePending = (): void => {
  const state = widgetBlobCache;
  if (state.timer !== null) { clearTimeout(state.timer); state.timer = null; }
  if (!state.dirty || !state.cacheId || !state.cache) return;
  state.dirty = false;
  const [id, blob] = [state.cacheId, state.cache];
  state.inFlight = saveTrackerStateBlob(id, blob).catch((error: unknown) => {
    log.ipc(`Failed to save widget state for ${id}: ${String(error)}`, 'error');
  });
};

export { writePending };
