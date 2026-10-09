/* @layer renderer-app @kind logic */
import { useProfilesStore } from '@drizztdourden08/brock-react';
import type { SettingLockCause } from '@drizztdourden08/brock-react';
import { runKindOfProfile } from '@app/game/randomizer-client';
import { isMobileHost } from '@app/platform/is-mobile-host';
import { MOBILE_ONLY_KEYS, ONLINE_ONLY_KEY_PREFIXES } from './host-lock.constants';

const isOnlineOnlyKey = (key: string): boolean => ONLINE_ONLY_KEY_PREFIXES.some((prefix) => key.startsWith(prefix));

const isOnlineProfile = (): boolean => runKindOfProfile(useProfilesStore.getState().active?.randomizer) === 'online';

const hostLockCause = (key: string): SettingLockCause | null => {
  if (MOBILE_ONLY_KEYS.includes(key) && !isMobileHost()) return 'mobileOnly';
  if (isOnlineOnlyKey(key) && !isOnlineProfile()) return 'onlineOnly';
  return null;
};

export { hostLockCause };
