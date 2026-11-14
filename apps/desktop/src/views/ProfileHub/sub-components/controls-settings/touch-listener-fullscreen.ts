/* @layer renderer-components @kind logic */
import { getInputManager } from '@app/input/input-manager/get-input-manager';
import { isTouchProfile } from '@app/input/touch-pad/is-touch-profile';

const touchListenerFullscreen = (): boolean => isTouchProfile(getInputManager().getProfile());

export { touchListenerFullscreen };
