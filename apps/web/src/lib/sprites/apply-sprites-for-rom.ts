/* @layer renderer-lib @kind logic */
/**
 * Points the shared sprite base at the active ROM's own app-sprite:// folder and
 * records whether sprites are actually extracted for it. The enhanced Vanilla
 * HUD reads sprites from this base, so it must always track the ROM in use.
 * Runs on every active-ROM change through useActivateRomSprites, and again from
 * useSpriteAvailability whenever a view finds the flag stale for the ROM it shows.
 *
 * A ROM without its sprite set, or with one that predates the current
 * extraction, gets one written in the background. The availability flag flips
 * once the files are on disk; a set that was already available and has merely
 * been REWRITTEN moves the revision instead, because the extraction clears the
 * folder before writing it again and every URL on screen fails for the duration.
 * Both signals reach the views that draw art (HUD style lock, item listings),
 * so they re-render with the files that are actually there now. One log line
 * per run names the base, the verdict and the file count, so a listing stuck on
 * placeholders is diagnosable from session.log.
 */
import { setSpritesBase, setSpritesRevision } from '@shared/game/logic/queries/item-sprites';
import { useSpriteAvailabilityStore } from '../../stores/sprite-availability-store';
import { log } from '../log-bus';
import * as spritesStore from '../storage/sprites-store';
import { ensureSpritesExtracted } from './ensure-sprites-extracted';

/** Records the on-disk verdict for `romFile` and resolves to its PNG count. */
const recordAvailability = async (romFile: string): Promise<number> => {
  try {
    const { extracted, count } = await spritesStore.checkSpritesExtracted(romFile);
    useSpriteAvailabilityStore.getState().setAvailability(romFile, extracted);
    return count;
  } catch {
    useSpriteAvailabilityStore.getState().setAvailability(romFile, false);
    return 0;
  }
};

/** Publishes the fresh files: new URLs first, then the store update that redraws. */
const noteRewritten = async (romFile: string): Promise<void> => {
  const store = useSpriteAvailabilityStore.getState();
  setSpritesRevision(store.revision + 1);
  store.noteSpritesRewritten();
  await recordAvailability(romFile);
};

// Only the ROM still active gets its flag refreshed: a profile switch mid-extraction
// must not have the old ROM's result overwrite the new ROM's flag.
const extractInBackground = async (romFile: string): Promise<void> => {
  const changed = await ensureSpritesExtracted(romFile);
  if (changed && useSpriteAvailabilityStore.getState().romFile === romFile) await noteRewritten(romFile);
};

const applySpritesForRom = async (romFile: string): Promise<void> => {
  const base = await spritesStore.getSpritesBaseUrl(romFile);
  setSpritesBase(base);
  const count = await recordAvailability(romFile);
  const version = await spritesStore.readSpritesVersion(romFile);
  const expected = spritesStore.expectedSpritesVersion();
  const versionNote = version === expected ? '' : ` (current ${expected})`;
  log.app(`Sprites for ${romFile}: base ${base || '(none)'}, available ${count > 0 ? 'yes' : 'no'} (${count} files), version ${version ?? 'none'}${versionNote}`);
  void extractInBackground(romFile);
};

export { applySpritesForRom };
