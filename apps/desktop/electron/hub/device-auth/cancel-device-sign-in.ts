/* @layer electron-main @kind logic */
import { signInState } from './sign-in-state';

const cancelDeviceSignIn = (): void => {
  signInState.cancelCurrent?.();
  signInState.cancelCurrent = null;
};

export { cancelDeviceSignIn };
