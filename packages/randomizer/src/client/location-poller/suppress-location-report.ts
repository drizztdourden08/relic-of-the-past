/* @layer bridge-wasm @kind logic */
import { pollerState } from './poller-state';

const suppressLocationReport = (key: string): void => {
  pollerState.reported.add(key);
  pollerState.suppressed.add(key);
};

export { suppressLocationReport };
