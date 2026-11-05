/* @layer bridge-wasm @kind logic */
import { log } from '../../../log-bus';
import { bindReceived, createOnlineRoom, resetConnection } from '@rotp/randomizer';
import type { ClientKit } from './online-client-kit.type';

const makeCleanup = (kit: ClientKit, cancelReconnect: () => void) => (): void => {
  const { deps, state, room, maps, network, deathLinks, setStatus } = kit;
  cancelReconnect();
  deathLinks.dispose();
  state.unsubscribeSwap?.();
  state.unsubscribeSwap = null;
  deps.core.disarm();
  for (const table of [maps.keyByLocationId, maps.locationIdByKey, maps.overriddenLocationIds]) table.clear();
  resetConnection(room);
  Object.assign(room, createOnlineRoom(deps.core), { received: bindReceived(room, deps.core) });
  state.link = null;
  network.stop();
  if (state.status !== 'error') setStatus('idle');
  log.randomizer('[Online] Session closed');
};

export { makeCleanup };
