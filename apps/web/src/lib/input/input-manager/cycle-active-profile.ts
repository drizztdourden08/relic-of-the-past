/* @layer renderer-lib @kind logic */
import type { InputManager } from './input-manager';
import { notifyQuietly } from './notify-quietly';

const cycleActiveProfile = (m: InputManager, direction: 1 | -1): void => {
  if (m.profiles.length < 2) return;
  const currentIndex = m.profiles.findIndex(p => p.id === m.activeProfile?.id);
  const base = currentIndex < 0 ? 0 : currentIndex;
  const nextIndex = (base + direction + m.profiles.length) % m.profiles.length;
  const next = m.profiles[nextIndex];
  if (!next || next.id === m.activeProfile?.id) return;
  m.setProfile(next);
  m.persistActiveProfileId?.(next.id);
  notifyQuietly(m.activeProfileListeners, next);
  m.reevaluateControllerPresence();
};

export { cycleActiveProfile };
