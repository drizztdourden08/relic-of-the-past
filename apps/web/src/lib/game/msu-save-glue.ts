/* @layer bridge-wasm @kind logic */
// Music position for saves of every kind. The core's snapshot layout is fixed (growing it would
// invalidate every save), so the position rides in a sidecar file beside each save.
import type { SaveKind } from '@shared/storage/save-paths';
import * as msuStore from '../storage/msu-store';
import { msuSnapshot, msuRestore } from './msu-session';
import { log } from '../log-bus';

/** Record where the music is, for a save just written. Always writes or clears, so an overwritten slot never keeps a stale position. */
const saveMusicPosition = async (profileId: string, kind: SaveKind, id: string | number): Promise<void> => {
  try {
    const position = msuSnapshot();
    if (position) await msuStore.writeMsuResume(profileId, kind, id, position);
    else await msuStore.deleteMsuResume(profileId, kind, id);
  } catch (err) {
    // A save must still succeed if only its music position could not be stored.
    log.app(`[MSU] Could not store music position: ${err instanceof Error ? err.message : err}`);
  }
};

/**
 * Resume the music a save was playing, at its position. A save with no stored position is left
 * alone, not silenced: loading a snapshot already re-announces the track, and "stop" here would
 * load an older save into silence.
 */
const restoreMusicPosition = async (profileId: string, kind: SaveKind, id: string | number): Promise<void> => {
  try {
    const position = await msuStore.readMsuResume(profileId, kind, id);
    if (position) msuRestore(position);
  } catch (err) {
    log.app(`[MSU] Could not restore music position: ${err instanceof Error ? err.message : err}`);
  }
};

export { saveMusicPosition, restoreMusicPosition };
