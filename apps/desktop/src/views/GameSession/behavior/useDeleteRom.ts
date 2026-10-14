/* @layer renderer-appshell @kind hook */
import { useCallback } from 'react';
import { log } from '@app/log-bus';
import * as romsStore from '@app/storage/roms-store';
import type { DeleteRomDeps } from './useProfileManagement.type';

const useDeleteRom = (deps: DeleteRomDeps) => {
  const { activeProfile, setActiveProfile, refreshProfilesAndRoms, showDialog, dismissDialog, onGameClear, setExtractionStates } = deps;

  return useCallback((romFile: string) => {
    const confirmed = async () => {
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
    };
    showDialog({
      title: 'Delete ROM',
      message: `This will remove "${romFile}" and all its extracted assets. Profiles using this ROM will also be deleted. This cannot be undone.`,
      confirmLabel: 'Delete ROM',
      variant: 'danger',
      onConfirm: () => { void confirmed(); },
    });
  }, [activeProfile, setActiveProfile, refreshProfilesAndRoms, showDialog, dismissDialog, onGameClear, setExtractionStates]);
};

export { useDeleteRom };
