/* @layer renderer-app @kind hook */
import { useMemo } from 'react';
import type { MenuEntry } from '@drizztdourden08/brock-react';
import { getInputManager } from '@app/input/input-manager/get-input-manager';
import { useProfileMenuState } from './behavior/useProfileMenuState';

const useInputProfileMenu = (): MenuEntry[] => {
  const { choices, activeId } = useProfileMenuState();
  return useMemo((): MenuEntry[] => {
    if (choices.length === 0) return [];
    const children: MenuEntry[] = choices.map((choice) => ({
      key: `input-profile-${choice.id}`,
      label: choice.name,
      checked: choice.id === activeId,
      onClick: () => getInputManager().switchProfile(choice.id),
    }));
    return [{ key: 'input-profile', label: 'Controller Profile', icon: 'gamepad-2', description: 'Switch the active controller profile.', children }];
  }, [choices, activeId]);
};

export { useInputProfileMenu };
