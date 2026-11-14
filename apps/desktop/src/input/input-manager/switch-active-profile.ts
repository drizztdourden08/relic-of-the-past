/* @layer renderer-lib @kind logic */
import type { InputProfile } from '@rotp/input-mapping';
import { notifyQuietly } from '@rotp/input-mapping';
import type { InputManager } from './input-manager';

const switchActiveProfile = (m: InputManager, next: InputProfile): void => {
  if (next.id === m.activeProfile?.id) return;
  m.setProfile(next);
  m.persistActiveProfileId?.(next.id);
  notifyQuietly(m.activeProfileListeners, next);
  m.reevaluateControllerPresence();
};

export { switchActiveProfile };
