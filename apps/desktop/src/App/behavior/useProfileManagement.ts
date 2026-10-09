/* @layer renderer-appshell @kind hook */
import { useState, useCallback } from 'react';
import type { CreateProfileOptions, CreateProfileResult } from '@shared/types/profile';
import { runCreateProfileFlow } from './create-profile-flow';
import { log } from '../../lib/log-bus';
import { spriteRomOf } from '../../lib/sprites/sprite-rom';
import { useActivateRomSprites } from '../../lib/sprites/useActivateRomSprites';
import * as profileStore from '../../lib/storage/profile-store';
import * as romsStore from '../../lib/storage/roms-store';
import { useReloadTarget } from './useReloadTarget';
import type { ProfileManagementParams } from './useProfileManagement.type';
import { useLoadProfileForGame } from './useLoadProfileForGame';
import { useRomActions } from './useRomActions';

const useProfileManagement = (params: ProfileManagementParams) => {
  const { showDialog, dismissDialog, onProfileLoaded, onGameClear } = params;

  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [romStatuses, setRomStatuses] = useState<RomInfo[]>([]);
  const [activeProfile, setActiveProfile] = useState<Profile | null>(null);
  const [loadingProfile, setLoadingProfile] = useState<string | null>(null);

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

  const loadProfileForGame = useLoadProfileForGame({ onGameClear, onProfileLoaded, setActiveProfile, setLoadingProfile });

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

  const { extractionStates, importingRom, handleImportRom, handleExtractAssets, handleDeleteRom } = useRomActions({
    activeProfile, setActiveProfile, refreshProfilesAndRoms, showDialog, dismissDialog, onGameClear,
  });

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
