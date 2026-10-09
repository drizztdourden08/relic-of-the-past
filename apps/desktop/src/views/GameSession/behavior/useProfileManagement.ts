/* @layer renderer-appshell @kind hook */
import { useState, useCallback, useEffect } from 'react';
import { useProfiles, useProfilesStore } from '@drizztdourden08/brock-react';
import type { CreateProfileOptions, CreateProfileResult } from '@shared/types/profile';
import { runCreateProfileFlow } from './create-profile-flow';
import { log } from '@app/lib/log-bus';
import { spriteRomOf } from '@rotp/packs';
import { useActivateRomSprites } from '@app/lib/sprites/useActivateRomSprites';
import * as romsStore from '@app/lib/storage/roms-store';
import { useReloadTarget } from './useReloadTarget';
import type { ProfileManagementParams } from './useProfileManagement.type';
import { useLoadProfileForGame } from './useLoadProfileForGame';
import { useRomActions } from './useRomActions';

const useProfileManagement = (params: ProfileManagementParams) => {
  const { showDialog, dismissDialog, onProfileLoaded, onGameClear } = params;
  const { profiles, active: activeProfile, select, refresh, removeConfirmed } = useProfiles();

  const [romStatuses, setRomStatuses] = useState<RomInfo[]>([]);
  const [loadingProfile, setLoadingProfile] = useState<string | null>(null);

  useActivateRomSprites(spriteRomOf(activeProfile?.romFile, romStatuses));

  const refreshProfilesAndRoms = useCallback(async () => {
    const [profileList, romStatusList] = await Promise.all([refresh(), romsStore.listRomsWithStatus()]);
    setRomStatuses(romStatusList);
    return { profiles: profileList, romStatuses: romStatusList };
  }, [refresh]);

  useEffect(() => { void refreshProfilesAndRoms(); }, [refreshProfilesAndRoms, activeProfile?.id]);

  const setActiveProfile = useCallback((profile: Profile | null) => {
    if (profile) void select(profile);
    else useProfilesStore.getState().setActive(null);
  }, [select]);

  const loadProfileForGame = useLoadProfileForGame({ onGameClear, onProfileLoaded, setActiveProfile, setLoadingProfile });

  useReloadTarget(activeProfile, loadProfileForGame);

  const handleSelectProfile = useCallback(async (profile: Profile) => {
    await select(profile);
  }, [select]);

  const handleCreateProfile = useCallback(async (opts: CreateProfileOptions): Promise<CreateProfileResult> => {
    const result = await runCreateProfileFlow(opts);
    if (!result.success) return result;
    await refreshProfilesAndRoms();
    await handleSelectProfile(result.profile);
    return result;
  }, [refreshProfilesAndRoms, handleSelectProfile]);

  const handleDeleteProfile = useCallback((id: string) => {
    const profile = profiles.find((p) => p.id === id);
    if (!profile) return;
    showDialog({
      title: 'Delete Profile',
      message: `Delete "${profile.name}"? Its save data will be lost. This cannot be undone.`,
      confirmLabel: 'Delete Profile',
      variant: 'danger',
      onConfirm: async () => {
        dismissDialog();
        if (activeProfile?.id === id) onGameClear();
        removeConfirmed(profile);
        log.app('Profile deleted');
        await refreshProfilesAndRoms();
      },
    });
  }, [profiles, activeProfile, refreshProfilesAndRoms, showDialog, dismissDialog, onGameClear, removeConfirmed]);

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
