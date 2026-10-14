/* @layer bridge-wasm @kind logic */
import { resetConnection } from '@rotp/randomizer';
import type { ClientKit } from './online-client-kit.type';

const makeCloseHandler = (kit: ClientKit, cleanup: () => void, scheduleReconnect: () => void) =>
  (opened: boolean): void => {
    const { config, deps, state, room, network, setStatus } = kit;
    state.link = null;
    resetConnection(room);
    network.closed();
    if (state.stopped) {
      cleanup();
      return;
    }
    if (!state.everConnected) {
      state.closeReason = opened ? 'The server closed before accepting the slot' : `Could not reach ${config.url}`;
      network.failed(state.closeReason);
    }
    deps.core.pausePolling();
    scheduleReconnect();
    setStatus('reconnecting');
  };

export { makeCloseHandler };
