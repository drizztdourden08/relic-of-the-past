/* @layer bridge-wasm @kind logic */
/**
 * Ties music position to saves of every kind.
 *
 * The core's snapshot layout is fixed — growing it would invalidate every existing save — so
 * the position rides in a sidecar file beside each save instead. Quick slots, manual saves and
 * auto-saves all go through here, so none of them can quietly skip it.
 */
import type { SaveKind } from '@shared/storage/save-paths';
import * as msuStore from '../storage/msu-store';
import { msuSnapshot, msuRestore } from './msu-session';
import { log } from '../log-bus';

/**
 * Record where the music is, for a save just written. Always writes or clears — never leaves a
 * previous save's position behind when a slot or save is overwritten.
 */
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
 * Resume the music a save was playing, at the position it was at.
 *
 * A save with no stored position is left alone rather than silenced: loading a snapshot already
 * makes the core re-announce its current track, so the right music is playing by the time this
 * runs — there is simply no offset to seek to. Overriding that with "stop" is what would make an
 * older save load into silence.
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
