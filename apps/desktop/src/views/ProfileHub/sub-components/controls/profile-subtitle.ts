/* @layer renderer-components @kind logic */
import type { InputProfile } from '@rotp/input-mapping';

const profileSubtitle = (profile: InputProfile): string =>
  profile.assignedDevice?.displayName ?? (profile.deviceType === 'keyboard' ? 'Keyboard' : 'Controller');

export { profileSubtitle };
