/* @layer bridge-wasm @kind logic */
import { log } from '../../log-bus';
import * as savesStore from '../../storage/saves-store';
import { getProfileId } from '@rotp/game-core';
import { whenCoreReady } from '@rotp/game-core';
import { loadStateFromBuffer } from '../state-buffers';

const loadNamedState = async (name: string): Promise<boolean> => {
  if (!(await whenCoreReady())) {
    log.error(`[LoadState] "${name}" not loaded: the core never became ready`);
    return false;
  }
  const profileId = getProfileId();
  if (!profileId) {
    log.error('[LoadState] ABORT: no profileId');
    return false;
  }
  const wanted = name.trim().toLowerCase();
  const saves = await savesStore.listNormalSaves(profileId);
  const match = saves.find((s) => s.name.toLowerCase() === wanted);
  if (!match) {
    log.error(`[LoadState] No manual save named "${name}". Available: ${saves.map((s) => s.name).join(', ') || 'none'}`);
    return false;
  }
  const buffer = await savesStore.loadNormalSave(profileId, match.id);
  if (!buffer) {
    log.error(`[LoadState] Manual save "${match.name}" (${match.id}) has no data on disk`);
    return false;
  }
  log.app(`[LoadState] Loading manual save "${match.name}" (${match.id}, ${buffer.byteLength} bytes)`);
  return loadStateFromBuffer(buffer);
};

export { loadNamedState };
