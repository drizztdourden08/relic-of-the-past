/* @layer bridge-wasm @kind logic */
import { AP_GAME, createNameTables, createListenerSet, createMessageLog, createGoalReporter, createOnlineRoom } from '@rotp/randomizer';
import type { ApClientPacket, ForeignOwners, OnlineDeps, OnlineSessionConfig, Placement } from '@rotp/randomizer';
import { createOnlineNetwork } from '../online-network';
import { createCheckReporter } from '../online-check-reporter';
import { createDeathLinkSwitch } from '../death-link-switch';
import type { ScoutMaps } from '../online-overrides';
import { initialClientState } from './initial-client-state';
import type { ClientKit, SessionStatus } from './online-client-kit.type';

const createClientKit = (config: OnlineSessionConfig, deps: OnlineDeps): ClientKit => {
  const { slotName, game = AP_GAME } = config;
  const { core, createSocket } = deps;
  const state = initialClientState();
  const statusListeners = createListenerSet<[SessionStatus]>();
  const placementListeners = createListenerSet<[Placement, ForeignOwners]>();
  const room = createOnlineRoom();
  const maps: ScoutMaps = { keyByLocationId: new Map(), locationIdByKey: new Map(), overriddenLocationIds: new Set() };
  const names = createNameTables();
  const messages = createMessageLog();

  const toSocket = (packet: ApClientPacket): void => state.link?.send(JSON.stringify([packet]));
  const network = createOnlineNetwork({
    config, room, names, core, createSocket, url: () => state.workingUrl, send: toSocket, sessionStatus: () => state.status,
  });
  const setStatus = (next: SessionStatus): void => {
    state.status = next;
    statusListeners.emit(next);
    network.changed();
  };

  const { send } = network;
  const goal = createGoalReporter(send);
  const deathLinks = createDeathLinkSwitch({ send, slotName, core });
  const reportCheck = createCheckReporter({ room, maps, goal, send });

  return {
    config, deps, game, state, statusListeners, placementListeners, room, maps, names, messages, goal,
    network, deathLinks, reportCheck, send, setStatus,
  };
};

export { createClientKit };
