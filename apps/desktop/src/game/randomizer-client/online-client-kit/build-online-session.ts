/* @layer bridge-wasm @kind logic */
import { log } from '../../../log-bus';
import type { OnlineSession } from '@rotp/randomizer';
import { handleSaveSwap } from '../online-save-swap';
import { senderNameOf } from '../online-received';
import type { ClientKit, LinkController } from './online-client-kit.type';

const buildOnlineSession = (kit: ClientKit, link: LinkController): OnlineSession => {
  const { config, deps, state, room, messages, network, deathLinks, reportCheck, send, statusListeners, placementListeners, setStatus } = kit;
  const { ctx, connect, endSession } = link;
  return {
    kind: 'online',
    get status() { return state.status; },
    get slotData() { return room.slotData; },
    get team() { return room.team; },
    get slot() { return room.slot; },
    get players() { return room.players; },
    get checkedLocations() { return room.checked; },
    get missingLocations() { return room.missing; },
    get messages() { return messages.messages; },
    get placement() { return state.placement; },
    get networkStatus() { return network.status; },

    async start() {
      state.stopped = false;
      network.reset();
      setStatus('starting');
      await deps.core.arm(config);
      if (!ctx.isLive()) {
        deps.core.disarm();
        return;
      }
      if (config.deathLink === true) deathLinks.set(true);
      state.unsubscribeSwap = deps.core.onSaveSwap(() => handleSaveSwap(ctx));
      log.randomizer(`[Online] Connecting to ${config.url}`);
      connect();
    },
    reportCheck,
    stop: endSession,
    onMessages: (listener) => messages.onChange(listener),
    onPlacement: (listener) => placementListeners.add(listener),
    onNetworkStatus: (listener) => network.onChange(listener),
    senderNameOf: (item) => senderNameOf(ctx, item),
    say: (text) => {
      if (room.connected && text.trim()) send({ cmd: 'Say', text });
    },
    onStatusChange: (listener) => statusListeners.add(listener),
  };
};

export { buildOnlineSession };
