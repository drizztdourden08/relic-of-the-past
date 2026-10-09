/* @layer renderer-lib @kind logic */
import { setSpritesBase, setSpritesRevision } from '@rotp/game-data';
import { useSpriteAvailabilityStore } from '../stores/sprite-availability-store';
import { log } from '../log-bus';
import * as spritesStore from '../storage/sprites-store';
import { ensureSpritesExtracted } from './ensure-sprites-extracted';

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

const publishRewrittenSet = async (romFile: string): Promise<void> => {
  const store = useSpriteAvailabilityStore.getState();
  setSpritesRevision(store.revision + 1);
  store.noteSpritesRewritten();
  await recordAvailability(romFile);
};

const isStillActiveRom = (romFile: string): boolean => useSpriteAvailabilityStore.getState().romFile === romFile;

const extractInBackground = async (romFile: string): Promise<void> => {
  const changed = await ensureSpritesExtracted(romFile);
  if (changed && isStillActiveRom(romFile)) await publishRewrittenSet(romFile);
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
