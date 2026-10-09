/* @layer renderer-components @kind hook */
import { useCallback, useEffect } from 'react';
import { useGameSession } from '@app/hooks/useGameSession';
import '../sub-components/DataManager.forms.css';
import '../sub-components/DataManager.detail.css';

const useDataLibrary = () => {
  const { profileMgmt, dialogs, game } = useGameSession();
  const { refreshProfilesAndRoms } = profileMgmt;

  useEffect(() => { void refreshProfilesAndRoms(); }, [refreshProfilesAndRoms]);

  const refresh = useCallback(() => { void refreshProfilesAndRoms(); }, [refreshProfilesAndRoms]);

  return { profileMgmt, onDeleteConfirm: dialogs.handleDeleteConfirm, isGameRunning: game.isRunning, refresh };
};

export { useDataLibrary };
