/* @layer renderer-app @kind hook */
import { useEffect, useState } from 'react';
import { getInputManager } from '@app/input/input-manager/get-input-manager';
import type { ProfileMenuState } from '../input-profile-menu.type';

const readState = (): ProfileMenuState => {
  const manager = getInputManager();
  return {
    choices: manager.getProfiles().map((p) => ({ id: p.id, name: p.name })),
    activeId: manager.getProfile()?.id ?? null,
  };
};

const NO_PROFILES: ProfileMenuState = { choices: [], activeId: null };

const useProfileMenuState = (): ProfileMenuState => {
  const [state, setState] = useState(NO_PROFILES);
  useEffect(() => {
    const manager = getInputManager();
    const refresh = (): void => setState(readState());
    refresh();
    const offList = manager.onProfilesChange(refresh);
    const offSet = manager.onProfileSet(refresh);
    return () => { offList(); offSet(); };
  }, []);
  return state;
};

export { useProfileMenuState };
