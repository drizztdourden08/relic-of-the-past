/* @layer renderer-lib @kind logic */
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
