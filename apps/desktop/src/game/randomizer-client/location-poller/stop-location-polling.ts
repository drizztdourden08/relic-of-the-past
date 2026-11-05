/* @layer bridge-wasm @kind logic */
import { onlinePoller } from './online-poller';
import { suppressSink } from './suppress-sink';

const stopLocationPolling = (): void => {
  onlinePoller.stop();
  suppressSink.current = null;
};

export { stopLocationPolling };
