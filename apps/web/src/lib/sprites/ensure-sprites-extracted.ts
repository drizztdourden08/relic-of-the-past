/* @layer renderer-lib @kind logic */
/**
 * Extracts a ROM's sprite set in the background when it is missing or predates
 * the current definitions, the sprite counterpart of the asset blob's
 * extract-if-missing at boot, so a user who never pressed "Extract sprites"
 * still gets item art. Runs at most once per ROM per session: the in-flight
 * promise is shared by concurrent callers (startup, profile select and boot all
 * ask for the same ROM), and a finished run, successful or not, is not repeated
 * on the next profile switch. The manual buttons keep their own path.
 */
import { log } from '../log-bus';
import * as spritesStore from '../storage/sprites-store';

const inFlight = new Map<string, Promise<boolean>>();
const attempted = new Set<string>();

const runExtraction = async (romFile: string, reason: string): Promise<boolean> => {
  log.app(`${reason} for ${romFile}, extracting sprites...`);
  const result = await spritesStore.extractSprites(romFile);
  if (!result.success) {
    log.error(`Sprite extraction failed: ${result.error}`);
    return false;
  }
  log.app(`Sprites extracted for ${romFile} (${result.count ?? 0} files)`);
  return true;
};

const extractIfNeeded = async (romFile: string): Promise<boolean> => {
  const { extracted } = await spritesStore.checkSpritesExtracted(romFile);
  if (!extracted) return runExtraction(romFile, 'No extracted sprites');
  if (await spritesStore.checkSpritesStale(romFile)) {
    return runExtraction(romFile, 'Extracted sprites predate the current extraction');
  }
  return false;
};

/** Resolves true when this call put a fresh set on disk, false when nothing changed. */
const ensureSpritesExtracted = (romFile: string): Promise<boolean> => {
  const pending = inFlight.get(romFile);
  if (pending) return pending;
  if (attempted.has(romFile) || !spritesStore.hasSpriteDefinitions()) return Promise.resolve(false);
  attempted.add(romFile);

  const run = extractIfNeeded(romFile).finally(() => { inFlight.delete(romFile); });
  inFlight.set(romFile, run);
  return run;
};

export { ensureSpritesExtracted };
