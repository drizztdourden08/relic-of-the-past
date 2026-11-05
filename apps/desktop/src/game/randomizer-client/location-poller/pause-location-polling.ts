/* @layer bridge-wasm @kind logic */
import { onlinePoller } from './online-poller';

const pauseLocationPolling = (): void => {
  onlinePoller.pause();
};

export { pauseLocationPolling };
