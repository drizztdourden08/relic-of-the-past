/* @layer bridge-wasm @kind logic */
import { log } from '../../log-bus';
import { AP_GAME } from '@rotp/randomizer';
import { createNameTables } from '@rotp/randomizer';
import { createListenerSet } from '@rotp/randomizer';
import { createMessageLog } from '@rotp/randomizer';
import { createOnlineNetwork } from './online-network';
import { createCheckReporter } from './online-check-reporter';
import { createGoalReporter } from '@rotp/randomizer';
import { createOnlineRoom, resetConnection } from '@rotp/randomizer';
import { createReconnector } from '@rotp/randomizer';
import { createDeathLinkSwitch } from './death-link-switch';
import { dispatchMessage } from './online-dispatch';
import { handleSaveSwap } from './online-save-swap';
import { openSocketLink } from '@rotp/randomizer';
import { senderNameOf } from './online-received';
import { serverUrlCandidates } from '@rotp/randomizer';
import type { Placement } from '@rotp/randomizer';
import type { ApClientPacket } from '@rotp/randomizer';
import type { ForeignOwners } from '@rotp/randomizer';
import type { OnlineContext } from '@rotp/randomizer';
import type { ScoutMaps } from './online-overrides';
import type { OnlineSession } from '@rotp/randomizer';
import type { OnlineSessionConfig } from '@rotp/randomizer';
import type { SocketLink } from '@rotp/randomizer';
import type { RandomizerSession } from '@rotp/randomizer';
import type { OnlineDeps } from '@rotp/randomizer';

const createOnlineClient = (config: OnlineSessionConfig, deps: OnlineDeps): OnlineSession => {
  const { url, slotName, game = AP_GAME, deathLink = false } = config;
  const { core, createSocket } = deps;
  const statusListeners = createListenerSet<[RandomizerSession['status']]>();
  const placementListeners = createListenerSet<[Placement, ForeignOwners]>();
  const room = createOnlineRoom();
  const maps: ScoutMaps = { keyByLocationId: new Map(), locationIdByKey: new Map(), overriddenLocationIds: new Set() };
  const names = createNameTables();
  const messages = createMessageLog();
  let status: RandomizerSession['status'] = 'idle';
  let link: SocketLink | null = null;
  let stopped = false;
  let everConnected = false;
  let closeReason = '';
  let workingUrl: string | null = null;
  let placement: Placement | null = null;
  let unsubscribeSwap: (() => void) | null = null;

  const toSocket = (packet: ApClientPacket): void => link?.send(JSON.stringify([packet]));
  const network = createOnlineNetwork({
    config, room, names, core, createSocket, url: () => workingUrl, send: toSocket, sessionStatus: () => status,
  });
  const setStatus = (next: RandomizerSession['status']): void => {
    status = next;
    statusListeners.emit(next);
    network.changed();
  };

  const { send } = network;
  const goal = createGoalReporter(send);
  const deathLinks = createDeathLinkSwitch({ send, slotName, core });
  const reportCheck = createCheckReporter({ room, maps, goal, send });

  const cleanup = (): void => {
    reconnector.cancel();
    deathLinks.dispose();
    unsubscribeSwap?.();
    unsubscribeSwap = null;
    core.disarm();
    for (const table of [maps.keyByLocationId, maps.locationIdByKey, maps.overriddenLocationIds]) table.clear();
    resetConnection(room);
    Object.assign(room, createOnlineRoom());
    link = null;
    network.stop();
    if (status !== 'error') setStatus('idle');
    log.randomizer('[Online] Session closed');
  };

  const endSession = (): void => {
    stopped = true;
    reconnector.cancel();
    if (!link?.close()) cleanup();
  };

  const fail = (message: string, logLine = message): void => {
    log.randomizer(logLine, 'error');
    network.failed(message);
    setStatus('error');
    endSession();
  };

  const handleClose = (opened: boolean): void => {
    link = null;
    resetConnection(room);
    network.closed();
    if (stopped) {
      cleanup();
      return;
    }
    if (!everConnected) {
      closeReason = opened ? 'The server closed before accepting the slot' : `Could not reach ${url}`;
      network.failed(closeReason);
    }
    core.pausePolling();
    reconnector.schedule();
    setStatus('reconnecting');
  };

  const ctx: OnlineContext = {
    config, game, core, room, maps, names, messages, goal, send, fail,
    reporter: { reportCheck },
    markConnected: () => {
      everConnected = true;
      reconnector.reset();
      setStatus('active');
    },
    isLive: () => !stopped,
    setPlacement: (next, foreignOwners = {}) => {
      placement = next;
      placementListeners.emit(next, foreignOwners);
    },
    setDeathLink: (enabled) => deathLinks.set(enabled),
  };

  const connect = (): void => {
    const candidates = workingUrl !== null ? [workingUrl] : serverUrlCandidates(url);
    link = openSocketLink(candidates, createSocket, {
      onOpen: (openedUrl) => {
        workingUrl = openedUrl;
        network.opened(openedUrl);
      },
      onMessage: (data) => dispatchMessage(ctx, data, network, deathLinks.handleBounced),
      onClose: handleClose,
    });
  };

  const reconnector = createReconnector(() => {
    network.attempting();
    connect();
  }, (delay, attempt) => {
    log.randomizer(`[Online] ${everConnected ? 'Connection lost' : closeReason}, retrying in ${delay / 1000}s`, 'warn');
    network.retrying(delay, attempt);
  });

  return {
    kind: 'online',
    get status() { return status; },
    get slotData() { return room.slotData; },
    get team() { return room.team; },
    get slot() { return room.slot; },
    get players() { return room.players; },
    get checkedLocations() { return room.checked; },
    get missingLocations() { return room.missing; },
    get messages() { return messages.messages; },
    get placement() { return placement; },
    get networkStatus() { return network.status; },

    async start() {
      stopped = false;
      network.reset();
      setStatus('starting');
      await core.arm(config);
      if (stopped) {
        core.disarm();
        return;
      }
      if (deathLink) deathLinks.set(true);
      unsubscribeSwap = core.onSaveSwap(() => handleSaveSwap(ctx));
      log.randomizer(`[Online] Connecting to ${url}`);
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

export { createOnlineClient };
export type { OnlineDeps } from '@rotp/randomizer';
