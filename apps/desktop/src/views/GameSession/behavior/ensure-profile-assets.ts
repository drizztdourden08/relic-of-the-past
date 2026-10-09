/* @layer renderer-appshell @kind logic */
import * as assetsStore from '@app/lib/storage/assets-store';
import { log } from '@app/lib/log-bus';

const ensureProfileAssets = async (romFile: string): Promise<ArrayBuffer | null> => {
  const hasAssets = await assetsStore.checkAssets(romFile);
  if (!hasAssets) {
    log.app(`No cached assets for ${romFile}, extracting...`);
    const result = await assetsStore.extractAssets(romFile);
    if (!result.success) {
      log.error(`Extraction failed: ${result.error}`);
      return null;
    }
  } else if (await assetsStore.checkAssetsStale(romFile)) {
    log.app(`Cached assets for ${romFile} predate the current bake format, recompiling...`);
    const result = await assetsStore.extractAssets(romFile);
    if (!result.success) {
      log.error(`Asset recompile failed: ${result.error}. Keeping the previous cached assets`);
    } else {
      log.app(`Assets recompiled for ${romFile}`);
    }
  }
  const buffer = await assetsStore.loadAssets(romFile);
  if (!buffer) {
    log.error('Failed to load assets after extraction');
    return null;
  }
  log.app(`Loaded assets (${(buffer.byteLength / 1024).toFixed(0)} KB)`);
  return buffer;
};

export { ensureProfileAssets };
