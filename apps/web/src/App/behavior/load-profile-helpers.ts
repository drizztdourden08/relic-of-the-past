/* @layer renderer-appshell @kind logic */
/** Async side-effect helpers for loadProfileForGame (input profile, MSU pack, assets). */
import { setLinkSpriteData, getInputManager } from '../../lib/game';
import * as assetsStore from '@app/lib/storage/assets-store';
import type { mergeSettings } from '../../lib/game/settings';
import { log } from '../../lib/log-bus';
import { readInputProfiles } from '@app/lib/storage/profile-data-store';
import { updateActiveInputProfileId } from '@app/lib/storage/profile-store';
import { readSpriteAsZspr } from '@app/lib/game/player-sheet/load-sheet';
import type { InputProfile } from '@shared/types/controls';
import { loadMsuPack } from '@app/lib/game/msu-pack-loader';

type Settings = ReturnType<typeof mergeSettings>;

const loadInputProfile = async (profileId: string, settings: Settings) => {
  try {
    const rawProfiles = await readInputProfiles(profileId);
    const inputProfiles = rawProfiles as InputProfile[];
    if (inputProfiles.length > 0) {
      const activeId = settings.activeInputProfileId;
      const active = inputProfiles.find(p => p.id === activeId) ?? inputProfiles[0];
      const mgr = getInputManager();
      mgr.setProfiles(inputProfiles);
      mgr.setActiveProfilePersist((id) => { void updateActiveInputProfileId(profileId, id); });
      mgr.setProfile(active);
      log.app(`Loaded input profile: ${active.name}`);
    }
  } catch {
    /* no saved profiles, so InputManager stays on keyboard default */
  }
};

// Stage the profile's selected player sprite for the next boot; the bridge writes it to MEMFS.
// Flattened on the way through, since a sprite pack is not something the core can read.
const loadPlayerSprite = async (settings: Settings) => {
  if (!settings.linkSprite) { setLinkSpriteData(null); return; }
  try {
    const bytes = await readSpriteAsZspr(settings.linkSprite);
    setLinkSpriteData(bytes ?? null);
    if (!bytes) log.app(`[PlayerSprite] Selected sprite "${settings.linkSprite}" not found`);
  } catch (err) {
    log.error(`[PlayerSprite] Failed to load sprite: ${err instanceof Error ? err.message : err}`);
    setLinkSpriteData(null);
  }
};

/**
 * Extract-if-missing (or if the cached blob predates the current bake format), then
 * load the cached asset blob for a ROM. Returns null (after logging) when the blob
 * is missing and extraction fails, so the boot aborts on null. A STALE blob is softer:
 * it still boots the game, so a failed recompile (e.g. the ROM file is gone) logs an
 * error and keeps the old blob instead of blocking the boot.
 */
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

export { ensureProfileAssets, loadInputProfile, loadMsuPack, loadPlayerSprite };
