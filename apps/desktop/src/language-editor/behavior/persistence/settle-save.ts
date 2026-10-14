/* @layer renderer-components @kind logic */
import type { PersistenceContext, SavedRun } from './persistence.type';

const settleSave = async (context: PersistenceContext, saved: SavedRun): Promise<void> => {
  const { refs, setDirty, setSaving, setSaveError, arm } = context;
  refs.inFlight.current = false;

  if (refs.epoch.current !== saved.era) return;
  if (refs.live.current) setSaving(false);
  if (saved.failure !== null) {
    if (refs.live.current) setSaveError(saved.failure);
    return;
  }

  refs.persisted.current = saved.at;
  const stale = refs.revision.current !== saved.at;
  if (refs.live.current) {
    setDirty(stale);
    if (stale) arm();
    return;
  }
  if (stale) await refs.runRef.current();
};

export { settleSave };
