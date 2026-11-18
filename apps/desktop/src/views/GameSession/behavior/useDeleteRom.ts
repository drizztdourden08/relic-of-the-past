/* @layer renderer-appshell @kind hook */
import { useCallback } from 'react';
import { useT } from '@drizztdourden08/brock-react';
import { log } from '@app/log-bus';
import * as romsStore from '@app/storage/roms-store';
import type { DeleteRomDeps } from './useProfileManagement.type';

const useDeleteRom = (deps: DeleteRomDeps) => {
  const { activeProfile, setActiveProfile, refreshProfilesAndRoms, showDialog, dismissDialog, onGameClear, setExtractionStates } = deps;
  const t = useT();

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
      title: t('views-game-session:deleteRom.title'),
      message: t('views-game-session:deleteRom.message', { romFile }),
      confirmLabel: t('views-game-session:deleteRom.confirm'),
      variant: 'danger',
      onConfirm: () => { void confirmed(); },
    });
  }, [activeProfile, setActiveProfile, refreshProfilesAndRoms, showDialog, dismissDialog, onGameClear, setExtractionStates, t]);
};

export { useDeleteRom };
