/* @layer renderer-appshell @kind hook */
import { useState, useCallback } from 'react';
import type { ConfirmDialog } from '../types';
import { log } from '../../lib/log-bus';
import { resetGame, setAutoSaveConfig } from '../../lib/game';
import { serializeToIni, mergeSettings } from '../../lib/game/settings';
import { applySpritesForRom } from '../../lib/sprites/apply-sprites-for-rom';
import * as profileStore from '../../lib/storage/profile-store';
import * as romsStore from '../../lib/storage/roms-store';
import * as assetsStore from '../../lib/storage/assets-store';
import { loadInputProfile, loadMsuPack } from './load-profile-helpers';

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

  const refreshProfilesAndRoms = useCallback(async () => {
    const [profileList, romStatusList] = await Promise.all([
      profileStore.listProfiles(),
      romsStore.listRomsWithStatus(),
    ]);
    setProfiles(profileList);
    setRomStatuses(romStatusList);
    return { profiles: profileList, romStatuses: romStatusList };
  }, []);

  const loadProfileForGame = useCallback(async (profile: Profile) => {
    onGameClear();
    await resetGame();

    setActiveProfile(profile);
    setLoadingProfile(profile.name);
    void applySpritesForRom(profile.romFile);
    log.app(`Loading profile: ${profile.name} (${profile.romFile})`);

    const savedSettings = await profileStore.readConfig(profile.id);
    const settings = mergeSettings((savedSettings ?? {}) as any);

    await loadInputProfile(profile.id, settings);
    await loadMsuPack(profile, settings);

    const msuPath = (profile.msuPack && settings.enableMSU !== 'false') ? '/msu/' : undefined;
    const ini = serializeToIni(settings, msuPath, profile.language);
    log.app(`Loaded profile settings (aspect: ${settings.aspectRatio}, viewport: ${settings.viewportConstraint}, renderer: ${settings.newRenderer ? 'new' : 'old'}, language: ${profile.language ?? 'us'})`);

    // Configure auto-save before game starts
    setAutoSaveConfig({
      enabled: settings.autoSaveEnabled,
      intervalSeconds: settings.autoSaveIntervalSeconds,
      maxEntries: settings.autoSaveMaxEntries,
      saveOnQuit: settings.saveOnQuit,
    });

    const hasAssets = await assetsStore.checkAssets(profile.romFile);
    if (!hasAssets) {
      log.app(`No cached assets for ${profile.romFile}, extracting...`);
      const result = await assetsStore.extractAssets(profile.romFile);
      if (!result.success) {
        log.error(`Extraction failed: ${result.error}`);
        setLoadingProfile(null);
        return;
      }
    }

    const buffer = await assetsStore.loadAssets(profile.romFile);
    if (buffer) {
      log.app(`Loaded assets (${(buffer.byteLength / 1024).toFixed(0)} KB)`);
      onProfileLoaded({
        assetData: new Uint8Array(buffer),
        configIni: ini,
        settings,
      });
      await profileStore.setLastProfile(profile.id);
      await profileStore.updateLastPlayed(profile.id);
    } else {
      log.error('Failed to load assets after extraction');
    }
    setLoadingProfile(null);
  }, [onGameClear, onProfileLoaded]);

  const handleSelectProfile = useCallback(async (profile: Profile) => {
    setActiveProfile(profile);
    void applySpritesForRom(profile.romFile);
    await profileStore.setLastProfile(profile.id);
  }, []);

  const handleCreateProfile = useCallback(async (name: string, romFile: string, language?: string, msuPack?: string) => {
    const profile = await profileStore.createProfile(name, romFile, language, msuPack);
    log.app(`Created profile: ${profile.name}`);
    await refreshProfilesAndRoms();
    setActiveProfile(profile);
    void applySpritesForRom(profile.romFile);
    await profileStore.setLastProfile(profile.id);
  }, [refreshProfilesAndRoms]);

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
