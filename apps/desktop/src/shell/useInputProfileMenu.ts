/* @layer renderer-app @kind hook */
import { useMemo } from 'react';
import { msg } from '@drizztdourden08/brock-core/i18n';
import type { MenuEntryDef } from '@drizztdourden08/brock-react';
import { getInputManager } from '@app/input/input-manager/get-input-manager';
import { KEYBOARD_DEFAULT } from '@rotp/input-mapping';
import { isBuiltInKeyboard } from '@app/input/profile-name/is-built-in-keyboard';
import { useProfileMenuState } from './behavior/useProfileMenuState';

const useInputProfileMenu = (): MenuEntryDef[] => {
  const { choices, activeId } = useProfileMenuState();
  return useMemo((): MenuEntryDef[] => {
    if (choices.length === 0) return [];
    const children: MenuEntryDef[] = choices.map((choice) => ({
      key: `input-profile-${choice.id}`,
      label: isBuiltInKeyboard(choice, KEYBOARD_DEFAULT.name) ? msg('profiles:controls.labels.keyboard') : choice.name,
      checked: choice.id === activeId,
      onClick: () => getInputManager().switchProfile(choice.id),
    }));
    return [{ key: 'input-profile', label: msg('profiles:menu.controller-profile'), icon: 'gamepad-2', description: msg('profiles:menu.controller-profile-description'), children }];
  }, [choices, activeId]);
};

export { useInputProfileMenu };
