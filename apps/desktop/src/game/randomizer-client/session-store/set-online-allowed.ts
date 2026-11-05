/* @layer bridge-wasm @kind logic */
import { onlineAllowed } from './online-allowed-slot';

const setOnlineAllowed = (allowed: boolean): void => {
  onlineAllowed.current = allowed;
};

export { setOnlineAllowed };
