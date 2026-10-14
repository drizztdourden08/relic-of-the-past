/* @layer renderer-components @kind hook */
import { useState } from 'react';
import { usePlatform } from '@drizztdourden08/brock-react';
import type { DialogState, UseHomeTabSavesParams } from './home-tab.type';
import { useAutoSaveActions } from './useAutoSaveActions';
import { useHomeTabLists } from './useHomeTabLists';
import { useHomeTabSramImport } from './useHomeTabSramImport';
import { useNormalSaveActions } from './useNormalSaveActions';
import { useNormalSaveDialogs } from './useNormalSaveDialogs';
import { useQuickSaveActions } from './useQuickSaveActions';

const useHomeTabSaves = (params: UseHomeTabSavesParams) => {
  const { profileId, isGameRunning, onStartGame } = params;
  const { filePicker } = usePlatform();
  const [busyNormal, setBusyNormal] = useState<string | null>(null);
  const [dialog, setDialog] = useState<DialogState>({ type: null });

  const { loadQuickSlots, loadNormalSaves, loadAutoSaves, ...lists } = useHomeTabLists(profileId);
  const quick = useQuickSaveActions({ isGameRunning, onStartGame, loadQuickSlots });
  const normal = useNormalSaveActions({ profileId, isGameRunning, onStartGame, setBusyNormal, setDialog, loadNormalSaves });
  const normalDialogs = useNormalSaveDialogs({
    profileId, dialog, setDialog, normalSaves: lists.normalSaves, setBusyNormal, loadNormalSaves,
  });
  const auto = useAutoSaveActions({ profileId, isGameRunning, onStartGame, loadAutoSaves });
  const sramImport = useHomeTabSramImport({ profileId, filePicker, dialog, setDialog });

  return {
    ...lists,
    ...quick,
    ...normal,
    ...normalDialogs,
    ...auto,
    ...sramImport,
    busyNormal,
    dialog,
    setDialog,
    heroSave: lists.normalSaves[0] ?? null,
  };
};

export { useHomeTabSaves };
export type { HomeTabSaves } from './home-tab.type';
