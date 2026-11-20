/* @layer renderer-app @kind hook */
import { useMemo } from 'react';
import { msg } from '@drizztdourden08/brock-core/i18n';
import { useT } from '@drizztdourden08/brock-react';
import type { MenuEntryDef } from '@drizztdourden08/brock-react';
import { getInputManager } from '@app/input/input-manager/get-input-manager';
import { shownProfileName } from '@app/input/profile-name/profile-name';
import { useProfileMenuState } from './behavior/useProfileMenuState';

const useInputProfileMenu = (): MenuEntryDef[] => {
  const { choices, activeId } = useProfileMenuState();
  const keyboardName = useT()('profiles:controls.labels.keyboard');
  return useMemo((): MenuEntryDef[] => {
    if (choices.length === 0) return [];
    const children: MenuEntryDef[] = choices.map((choice) => ({
      key: `input-profile-${choice.id}`,
      label: shownProfileName(choice, keyboardName),
      checked: choice.id === activeId,
      onClick: () => getInputManager().switchProfile(choice.id),
    }));
    return [{ key: 'input-profile', label: msg('profiles:menu.controller-profile'), icon: 'gamepad-2', description: msg('profiles:menu.controller-profile-description'), children }];
  }, [choices, activeId, keyboardName]);
};

export { useInputProfileMenu };
