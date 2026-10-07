/* @layer renderer-lib @kind logic */
/**
 * Profile management for InputManager, covering the saved-profile list, the active-profile
 * change subscription, and the profile-cycle shortcut. Operates on the instance
 * (like input-manager-{lifecycle,events}); the class exposes thin delegators.
 */

import type { InputProfile } from '@shared/types/controls';
import type { ActiveProfileListener } from './input-manager-types';
import type { InputManager } from './input-manager';

/** Register the profile-next/prev function actions to cycle the active profile. */
const wireProfileActions = (m: InputManager): void => {
  m.functionActions.onAction('profile-next', () => cycleActiveProfile(m, 1));
  m.functionActions.onAction('profile-prev', () => cycleActiveProfile(m, -1));
};

/** Keep the full profile list in sync so cycling can pick the next/previous one. */
const setProfiles = (m: InputManager, profiles: InputProfile[]): void => {
  m.profiles = profiles;
};

const subscribeActiveProfile = (m: InputManager, listener: ActiveProfileListener): () => void => {
  m.activeProfileListeners.add(listener);
  return () => m.activeProfileListeners.delete(listener);
};

/** Switch the active profile by an offset (+1 next, -1 previous), wrapping around. */
const cycleActiveProfile = (m: InputManager, direction: 1 | -1): void => {
  if (m.profiles.length < 2) return;
  const currentIndex = m.profiles.findIndex(p => p.id === m.activeProfile?.id);
  const base = currentIndex < 0 ? 0 : currentIndex;
  const nextIndex = (base + direction + m.profiles.length) % m.profiles.length;
  const next = m.profiles[nextIndex];
  if (!next || next.id === m.activeProfile?.id) return;
  m.setProfile(next);
  m.persistActiveProfileId?.(next.id);
  for (const fn of m.activeProfileListeners) {
    try { fn(next); } catch { /* ignore */ }
  }
  // The mapped device set just changed, so pause if the new profile's controller is
  // absent, or resume if it's now present.
  m.reevaluateControllerPresence();
};

export { wireProfileActions, setProfiles, subscribeActiveProfile, cycleActiveProfile };
