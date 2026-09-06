/* @layer renderer-appshell @kind hook */
import { useState, useCallback } from 'react';
import type { ConfirmDialog } from '../types';
import type { CreateProfileOptions, CreateProfileResult } from '@shared/types/profile';
import { runCreateProfileFlow } from './create-profile-flow';
import { log } from '../../lib/log-bus';
import { resetGame, setAutoSaveConfig } from '../../lib/game';
import { serializeToIni, mergeSettings } from '../../lib/game/settings';
import { spriteRomOf } from '../../lib/sprites/sprite-rom';
import { useActivateRomSprites } from '../../lib/sprites/useActivateRomSprites';
import * as profileStore from '../../lib/storage/profile-store';
import * as romsStore from '../../lib/storage/roms-store';
import * as assetsStore from '../../lib/storage/assets-store';
import { ensureProfileAssets, loadInputProfile, loadMsuPack, loadPlayerSprite } from './load-profile-helpers';
import { gateRandomizerBoot } from './randomizer-boot-gate';
import { useReloadTarget } from './useReloadTarget';

const useProfileManagement = (params: {
  showDialog: (config: ConfirmDialog) => void;
  dismissDialog: () => void;
  onProfileLoaded: (data: {
    assetData: Uint8Array;
    configIni: string;
    settings: ReturnType<typeof mergeSettings>;
  }) => void;
  onGameClear: () => void;
}) => {
  const { showDialog, dismissDialog, onProfileLoaded, onGameClear } = params;

  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [romStatuses, setRomStatuses] = useState<RomInfo[]>([]);
  const [extractionStates, setExtractionStates] = useState<Record<string, RomExtractionStatus>>({});
  const [activeProfile, setActiveProfile] = useState<Profile | null>(null);
  const [importingRom, setImportingRom] = useState(false);
  const [loadingProfile, setLoadingProfile] = useState<string | null>(null);

  // Every path that changes the active profile lands in setActiveProfile, so this is the
  // one place the ROM's sprite set is activated (base URL + availability + extraction).
  // With no profile active a ready ROM stands in (spriteRomOf), because the creation
  // form draws item art before any profile exists and would otherwise show placeholders
  // over a set that is sitting on disk.
  useActivateRomSprites(spriteRomOf(activeProfile?.romFile, romStatuses));

  const refreshProfilesAndRoms = useCallback(async () => {
    const [profileList, romStatusList] = await Promise.all([
      profileStore.listProfiles(),
      romsStore.listRomsWithStatus(),
    ]);
    setProfiles(profileList);
    setRomStatuses(romStatusList);
    return { profiles: profileList, romStatuses: romStatusList };
  }, []);

  const loadProfileForGame = useCallback(async (staleProfile: Profile) => {
    onGameClear();
    await resetGame();

    // Re-read the profile from storage for THIS boot: the caller's object can be a snapshot
    // from an earlier load, and fields edited in Data Manager since (msuPack, language) must
    // reach the game, not the values the snapshot was taken with.
    const profile = (await profileStore.listProfiles()).find((p) => p.id === staleProfile.id) ?? staleProfile;

    // Deliberately the CALLER's object, not the re-read one. Automation keys an effect on
    // activeProfile's identity (App/behavior/useAutoTest.ts), so handing back a fresh object
    // re-runs that effect, whose cleanup cancels the launch already in flight. The run then
    // stops before it loads its save state. Nothing needs the fresh object in state: the
    // settings UI reads the pack from storage itself.
    setActiveProfile(staleProfile);
    setLoadingProfile(profile.name);
    log.app(`Loading profile: ${profile.name} (${profile.romFile})`);

    const savedSettings = await profileStore.readConfig(profile.id);
    const settings = mergeSettings((savedSettings ?? {}) as any);

    await loadInputProfile(profile.id, settings);
    await loadMsuPack(profile, settings);
    await loadPlayerSprite(settings);

    // No MSU path any more: music packs are played by the app, not the core, so nothing is
    // written into the core's virtual filesystem for it to open.
    const ini = serializeToIni(settings, undefined, profile.language);
    log.app(`Loaded profile settings (aspect: ${settings.aspectRatio}, viewport: ${settings.viewportConstraint}, renderer: ${settings.newRenderer ? 'new' : 'old'}, language: ${profile.language ?? 'us'})`);

    // Configure auto-save before game starts
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

    // Randomizer gate: a randomized profile only boots when its session can
    // actually start afterwards (placement on disk / server reachable).
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
  }, [onGameClear, onProfileLoaded]);

  useReloadTarget(activeProfile, loadProfileForGame);

  const handleSelectProfile = useCallback(async (profile: Profile) => {
    setActiveProfile(profile);
    await profileStore.setLastProfile(profile.id);
  }, []);

  const handleCreateProfile = useCallback(async (opts: CreateProfileOptions): Promise<CreateProfileResult> => {
    const result = await runCreateProfileFlow(opts);
    if (!result.success) return result;
    await refreshProfilesAndRoms();
    await handleSelectProfile(result.profile);
    return result;
  }, [refreshProfilesAndRoms, handleSelectProfile]);

  const handleDeleteProfile = useCallback((id: string) => {
    const profile = profiles.find((p) => p.id === id);
    showDialog({
      title: 'Delete Profile',
      message: `Delete "${profile?.name ?? 'this profile'}"? Its save data will be lost. This cannot be undone.`,
      confirmLabel: 'Delete Profile',
      variant: 'danger',
      onConfirm: async () => {
        dismissDialog();
        await profileStore.deleteProfile(id);
        log.app('Profile deleted');
        if (activeProfile?.id === id) {
          setActiveProfile(null);
          onGameClear();
        }
        await refreshProfilesAndRoms();
      },
    });
  }, [profiles, activeProfile, refreshProfilesAndRoms, showDialog, dismissDialog, onGameClear]);

  const handleImportRom = useCallback(async () => {
    const result = await romsStore.importPicked();
    if (!result) return; // cancelled

    setImportingRom(true);
    if (!result.success) {
      log.error(`Failed to import ROM: ${result.error}`);
      setImportingRom(false);
      return;
    }

    log.app(result.alreadyExists ? `ROM already imported: ${result.romFile}` : `ROM imported: ${result.romFile}`);
    log.app(`Extracting assets for ${result.romFile}...`);
    setExtractionStates((prev) => ({ ...prev, [result.romFile]: 'extracting' }));
    await refreshProfilesAndRoms();
    setImportingRom(false);

    const extractResult = await assetsStore.extractAssets(result.romFile);
    if (!extractResult.success) {
      log.error(`Extraction failed: ${extractResult.error}`);
      setExtractionStates((prev) => ({ ...prev, [result.romFile]: 'failed' }));
    } else {
      setExtractionStates((prev) => ({ ...prev, [result.romFile]: 'ready' }));
    }

    await refreshProfilesAndRoms();
  }, [refreshProfilesAndRoms]);

  const handleExtractAssets = useCallback(async (romFile: string) => {
    log.app(`Extracting assets for ${romFile}...`);
    setExtractionStates((prev) => ({ ...prev, [romFile]: 'extracting' }));
    const result = await assetsStore.extractAssets(romFile);
    if (!result.success) {
      log.error(`Extraction failed: ${result.error}`);
      setExtractionStates((prev) => ({ ...prev, [romFile]: 'failed' }));
    } else {
      setExtractionStates((prev) => ({ ...prev, [romFile]: 'ready' }));
    }
    await refreshProfilesAndRoms();
  }, [refreshProfilesAndRoms]);

  const handleDeleteRom = useCallback((romFile: string) => {
    showDialog({
      title: 'Delete ROM',
      message: `This will remove "${romFile}" and all its extracted assets. Profiles using this ROM will also be deleted. This cannot be undone.`,
      confirmLabel: 'Delete ROM',
      variant: 'danger',
      onConfirm: async () => {
        dismissDialog();
        await romsStore.deleteRom(romFile);
        log.app(`Removed ROM: ${romFile}`);
        setExtractionStates((prev) => {
          const next = { ...prev };
          delete next[romFile];
          return next;
        });
        if (activeProfile?.romFile === romFile) {
          setActiveProfile(null);
          onGameClear();
        }
        await refreshProfilesAndRoms();
      },
    });
  }, [activeProfile, refreshProfilesAndRoms, showDialog, dismissDialog, onGameClear]);

  const romDisplayInfos = romStatuses.map((rom) => ({
    ...rom,
    extractionStatus: extractionStates[rom.romFile] ?? (rom.hasAssets ? 'ready' : 'idle'),
  }));

  return {
    profiles,
    romStatuses,
    extractionStates,
    romDisplayInfos,
    activeProfile,
    setActiveProfile,
    importingRom,
    loadingProfile,
    loadProfileForGame,
    refreshProfilesAndRoms,
    handleSelectProfile,
    handleCreateProfile,
    handleDeleteProfile,
    handleImportRom,
    handleExtractAssets,
    handleDeleteRom,
  };
};

export { useProfileManagement };
