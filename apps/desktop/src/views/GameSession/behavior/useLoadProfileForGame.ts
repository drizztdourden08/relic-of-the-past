/* @layer renderer-appshell @kind hook */
import { useCallback } from 'react';
import { log } from '@app/log-bus';
import { resetGame, setAutoSaveConfig } from '@app/game';
import { serializeToIni, mergeSettings } from '@rotp/game-core';
import { experimentalFeaturesEnabled } from '@rotp/features';
import * as profileStore from '@app/storage/profile-store';
import { loadMsuPack } from '@app/game/msu-pack-loader';
import { gateRandomizerBoot } from '@drizztdourden08/brock-randomizer/session';
import { resetSession, setOnlineAllowed } from '@app/game/randomizer-client';
import { DEFAULT_SLOT_NAME } from '@rotp/randomizer';
import { onlineSlotName } from '@app/randomizer/rotp-randomizer/online-slot-name-slot';
import type { LoadProfileForGameDeps } from './useProfileManagement.type';
import { ensureProfileAssets } from './ensure-profile-assets';
import { loadInputProfile } from './load-input-profile';
import { loadPlayerSprite } from './load-player-sprite';

const useLoadProfileForGame = ({ onGameClear, onProfileLoaded, setActiveProfile, setLoadingProfile }: LoadProfileForGameDeps) =>
  useCallback(async (staleProfile: Profile) => {
    onGameClear();
    await resetGame();

    const profile = (await profileStore.listProfiles()).find((p) => p.id === staleProfile.id) ?? staleProfile;

    setActiveProfile(staleProfile);
    setLoadingProfile(profile.name);
    log.app(`Loading profile: ${profile.name} (${profile.romFile})`);

    const savedSettings = await profileStore.readConfig(profile.id);
    const settings = mergeSettings((savedSettings ?? {}));

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
      const experimental = experimentalFeaturesEnabled(settings);
      setOnlineAllowed(experimental);
      onlineSlotName.current = profile.randomizer.slotName ?? DEFAULT_SLOT_NAME;
      const gate = await gateRandomizerBoot(profile.id, profile.randomizer);
      if (!gate.ok) {
        log.error(gate.detail);
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
