/* @layer renderer-lib @kind hook */
import { useEffect, useState } from 'react';
import { getInputManager } from '../input-manager/get-input-manager';
import { isTouchProfile } from './is-touch-profile';

const useTouchProfileActive = (): boolean => {
  const [active, setActive] = useState(() => isTouchProfile(getInputManager().getProfile()));

  useEffect(() => {
    const manager = getInputManager();
    const refresh = (): void => setActive(isTouchProfile(manager.getProfile()));
    refresh();
    return manager.onActiveProfileChange(refresh);
  }, []);

  return active;
};

export { useTouchProfileActive };
