/* @layer bridge-wasm @kind logic */
import { createListenerSet } from './listener-set';
import { createNetworkFacts, observeClient, observeClose, observeServer } from './network-facts';
import { createPinger } from './network-ping';
import { createPresence } from './network-presence';
import { createRoster } from './network-roster';
import { buildNetworkStatus } from './network-status';
import type { ApClientPacket } from './ap-protocol.type';
import type { NetworkStatus } from './network-status.type';
import type { NetworkMonitor, NetworkMonitorDeps } from './network-monitor.type';

const createNetworkMonitor = (deps: NetworkMonitorDeps): NetworkMonitor => {
  const { config, room, names, core, trackers, sessionStatus, now = Date.now } = deps;
  let facts = createNetworkFacts();
  const presence = createPresence();
  const listeners = createListenerSet<[NetworkStatus]>();
  let pinging = false;

  const build = (): NetworkStatus => buildNetworkStatus({
    sessionStatus: sessionStatus(), config, facts, room, names, core, ping: pinger, presence, trackers,
  });
  const changed = (): void => {
    if (!pinging && room.connected && room.slot !== null) {
      pinging = true;
      pinger.start(room.slot);
      roster.query();
    }
    if (listeners.size > 0) listeners.emit(build());
  };
  const countAndSend = (packet: ApClientPacket): void => {
    observeClient(facts, packet);
    deps.send(packet);
  };
  const pinger = createPinger({ send: countAndSend, onSample: changed, now });
  const roster = createRoster({
    room, presence, send: countAndSend, isLinked: trackers.isLinked,
    onSettled: () => {
      trackers.open();
      changed();
    },
  });
  const forgetConnection = (): void => {
    pinging = false;
    pinger.stop();
    roster.reset();
    trackers.closeAll();
    presence.clear();
  };

  return {
    get status() { return build(); },
    onChange: (listener) => listeners.add(listener),
    received(packet) {
      observeServer(facts, packet, now());
      if (packet.cmd === 'Bounced') return pinger.handleBounced(packet);
      if (packet.cmd === 'PrintJSON') presence.handlePrint(packet, room.team);
      roster.received(packet);
      return false;
    },
    changed,
    send: (packet) => {
      countAndSend(packet);
      changed();
    },
    opened(url) {
      facts.url = url;
      facts.error = null;
      changed();
    },
    closed() {
      forgetConnection();
      observeClose(facts);
      changed();
    },
    retrying(delayMs, attempt) {
      facts.reconnectAttempt = attempt;
      facts.nextRetryAt = now() + delayMs;
      facts.retryInFlight = false;
      changed();
    },
    attempting() {
      facts.nextRetryAt = null;
      facts.retryInFlight = true;
      changed();
    },
    failed(message) {
      facts.error = message.replace(/^\[Online\]\s*/, '');
      changed();
    },
    stop() {
      forgetConnection();
      changed();
    },
    reset() {
      forgetConnection();
      facts = createNetworkFacts();
    },
  };
};

export { createNetworkMonitor };
export type { NetworkMonitor } from './network-monitor.type';
