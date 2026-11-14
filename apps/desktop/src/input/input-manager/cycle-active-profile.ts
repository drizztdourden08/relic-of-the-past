/* @layer renderer-lib @kind logic */
import type { InputManager } from './input-manager';
import { switchActiveProfile } from './switch-active-profile';

const cycleActiveProfile = (m: InputManager, direction: 1 | -1): void => {
  if (m.profiles.length < 2) return;
  const currentIndex = m.profiles.findIndex(p => p.id === m.activeProfile?.id);
  const base = currentIndex < 0 ? 0 : currentIndex;
  const next = m.profiles[(base + direction + m.profiles.length) % m.profiles.length];
  if (next) switchActiveProfile(m, next);
};

export { cycleActiveProfile };
