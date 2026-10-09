/* @layer renderer-appshell @kind hook */
import { useCallback } from 'react';
import type { GameSettings } from '@rotp/features';
import { log } from '@app/lib/log-bus';
import { resetGame, setAutoSaveConfig } from '@app/lib/game';
import { serializeToIni, mergeSettings } from '@app/lib/game/settings';
import * as profileStore from '@app/lib/storage/profile-store';
import { loadMsuPack } from '@app/lib/game/msu-pack-loader';
import { resetSession } from '@app/lib/game/randomizer-client';
import type { LoadProfileForGameDeps } from './useProfileManagement.type';
import { ensureProfileAssets } from './ensure-profile-assets';
import { loadInputProfile } from './load-input-profile';
import { loadPlayerSprite } from './load-player-sprite';
import { gateRandomizerBoot } from './randomizer-boot-gate';

const useLoadProfileForGame = ({ onGameClear, onProfileLoaded, setActiveProfile, setLoadingProfile }: LoadProfileForGameDeps) =>
  useCallback(async (staleProfile: Profile) => {
    onGameClear();
    await resetGame();

    const profile = (await profileStore.listProfiles()).find((p) => p.id === staleProfile.id) ?? staleProfile;

    setActiveProfile(staleProfile);
    setLoadingProfile(profile.name);
    log.app(`Loading profile: ${profile.name} (${profile.romFile})`);

    const savedSettings = await profileStore.readConfig(profile.id);
    const settings = mergeSettings((savedSettings ?? {}) as Partial<GameSettings>);

    await loadInputProfile(profile.id, settings);
    await loadMsuPack(profile, settings);
    await loadPlayerSprite(settings);

    const ini = serializeToIni(settings, undefined, profile.language);
    log.app(`Loaded profile settings (aspect: ${settings.aspectRatio}, viewport: ${settings.viewportConstraint}, renderer: ${settings.newRenderer ? 'new' : 'old'}, language: ${profile.language ?? 'us'})`);

    setAutoSaveConfig({
      enabled: settings.autoSaveEnabled,
      intervalSeconds: settings.autoSaveIntervalSeconds,
      maxEntries: settings.autoSaveMaxEntries,
      saveOnQuit: settings.saveOnQuit,
    });

    const buffer = await ensureProfileAssets(profile.romFile);
    if (!buffer) {
      setLoadingProfile(null);
      return;
    }

    resetSession();

    if (profile.randomizer) {
      const gate = await gateRandomizerBoot(profile.id, profile.randomizer);
      if (!gate.ok) {
        log.error(gate.reason);
        setLoadingProfile(null);
        return;
      }
    }

    onProfileLoaded({
      assetData: new Uint8Array(buffer),
      configIni: ini,
      settings,
    });
    await profileStore.setLastProfile(profile.id);
    await profileStore.updateLastPlayed(profile.id);
    setLoadingProfile(null);
  }, [onGameClear, onProfileLoaded, setActiveProfile, setLoadingProfile]);

export { useLoadProfileForGame };
