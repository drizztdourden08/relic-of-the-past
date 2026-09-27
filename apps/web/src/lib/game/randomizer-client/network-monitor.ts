/* @layer bridge-wasm @kind logic */
/**
 * The online client's network section, as an Observer on its traffic: every packet in and out
 * passes through here, and so do the socket's open and close, the reconnect schedule and the
 * error that ends a session. Listeners get a fresh NetworkStatus (network-status.ts) after each.
 * Once the slot is accepted the ping (network-ping.ts) runs, its echoes stopping here, and the
 * roster is asked for (network-roster.ts); when it settles the tracker links open, and they
 * close with the connection.
 */
import { createListenerSet } from './listener-set';
import { createNetworkFacts, observeClient, observeClose, observeServer } from './network-facts';
import { createPinger } from './network-ping';
import { createPresence } from './network-presence';
import { createRoster } from './network-roster';
import { buildNetworkStatus } from './network-status';
import type { NameTables } from './ap-names';
import type { ApClientPacket, ApServerPacket } from './ap-protocol.type';
import type { NetworkStatus, NetworkStatusListener } from './network-status.type';
import type { OnlineCore } from './online-core.type';
import type { OnlineRoom } from './online-room';
import type { OnlineSessionConfig } from './online-session-config.type';
import type { RandomizerSession } from './session.type';
import type { TrackerLinks } from './tracker-links';

interface NetworkMonitorDeps {
  config: OnlineSessionConfig;
  room: OnlineRoom;
  names: NameTables;
  core: Pick<OnlineCore, 'readReceivedIndex' | 'isFileInPlay'>;
  trackers: TrackerLinks;
  /** Straight to the socket. */
  send(packet: ApClientPacket): void;
  sessionStatus(): RandomizerSession['status'];
  now?: () => number;
}

interface NetworkMonitor {
  readonly status: NetworkStatus;
  onChange(listener: NetworkStatusListener): () => void;
  /** A packet arrived; true when it was a ping echo, which goes no further. */
  received(packet: ApServerPacket): boolean;
  /** A message was handled: the room state moved, so listeners hear it. */
  changed(): void;
  /** Counts the packet and hands it to the socket. */
  send(packet: ApClientPacket): void;
  opened(url: string): void;
  closed(): void;
  retrying(delayMs: number, attempt: number): void;
  /** The scheduled try started; it stays in flight until the next schedule or the slot is accepted. */
  attempting(): void;
  failed(message: string): void;
  /** Session end: the ping stops; the facts stay readable, an error among them. */
  stop(): void;
  /** Session start: nothing of an earlier run is kept. */
  reset(): void;
}

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
  /** The connection is gone: what was learned about it goes too. */
  const halt = (): void => {
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
      halt();
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
      halt();
      changed();
    },
    reset() {
      halt();
      facts = createNetworkFacts();
    },
  };
};

export { createNetworkMonitor };
export type { NetworkMonitor };
