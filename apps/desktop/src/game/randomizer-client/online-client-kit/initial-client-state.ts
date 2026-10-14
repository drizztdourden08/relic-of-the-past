/* @layer bridge-wasm @kind logic */
import type { ClientState } from './online-client-kit.type';

const initialClientState = (): ClientState => ({
  status: 'idle',
  link: null,
  stopped: false,
  everConnected: false,
  closeReason: '',
  workingUrl: null,
  placement: null,
  unsubscribeSwap: null,
});

export { initialClientState };
