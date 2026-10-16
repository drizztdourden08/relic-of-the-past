/* @layer renderer-components @kind hook */
import { useState } from 'react';
import { usePlatform } from '@drizztdourden08/brock-react';
import type { DialogState, UseHomeTabSavesParams } from './home-tab.type';
import { useAutoSaveActions } from './useAutoSaveActions';
import { useHomeTabLists } from './useHomeTabLists';
import { useHomeTabSramImport } from './useHomeTabSramImport';
import { useNormalSaveActions } from './useNormalSaveActions';
import { useQuickSaveActions } from './useQuickSaveActions';

const useHomeTabSaves = (params: UseHomeTabSavesParams) => {
  const { profileId, isGameRunning, onStartGame } = params;
  const { filePicker } = usePlatform();
  const [dialog, setDialog] = useState<DialogState>({ type: null });
  const base = { profileId, isGameRunning, onStartGame };

  const { loadQuickSlots, loadNormalSaves, loadAutoSaves, ...lists } = useHomeTabLists(profileId);
  const quick = useQuickSaveActions({ ...base, loadQuickSlots });
  const normal = useNormalSaveActions({ ...base, loadNormalSaves });
  const auto = useAutoSaveActions({ ...base, loadAutoSaves });
  const sramImport = useHomeTabSramImport({ profileId, filePicker, dialog, setDialog });
  const heroSave = lists.normalSaves[0] ?? null;

  return {
    ...lists,
    ...quick,
    ...normal,
    ...auto,
    ...sramImport,
    dialog,
    setDialog,
    heroSave,
  };
};

export { useHomeTabSaves };
