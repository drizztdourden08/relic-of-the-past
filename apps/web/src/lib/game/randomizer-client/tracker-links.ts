/* @layer bridge-wasm @kind logic */
/**
 * One tracker link (tracker-link.ts) per other player on this slot's team, opened once the
 * main connection's roster settled (network-roster.ts) and closed with that connection.
 * Off when the profile says not to track the others, since each is a socket of its own.
 */
import { createTrackerLink } from './tracker-link';
import type { CreateSocket } from './ap-socket.type';
import type { OnlineRoom } from './online-room';
import type { OnlineSessionConfig } from './online-session-config.type';
import type { TrackerLink, TrackerProgress } from './tracker-link';

interface TrackerLinksDeps {
  config: OnlineSessionConfig;
  room: OnlineRoom;
  createSocket: CreateSocket;
  /** The URL the main connection opened on; null before it did. */
  url(): string | null;
  /** This install's client id. */
  uuid(): string;
  onChange(): void;
}

interface TrackerLinks {
  /** A link for every other player not linked yet. */
  open(): void;
  closeAll(): void;
  progressOf(slot: number): TrackerProgress | null;
  isLinked(slot: number): boolean;
  readonly size: number;
}

const createTrackerLinks = (deps: TrackerLinksDeps): TrackerLinks => {
  const { config, room, createSocket, url, uuid, onChange } = deps;
  const links = new Map<number, TrackerLink>();
  const enabled = config.trackOtherPlayers !== false;

  return {
    open() {
      const address = url();
      if (!enabled || address === null || room.team === null) return;
      for (const player of room.players) {
        if (player.team !== room.team || player.slot === room.slot || links.has(player.slot)) continue;
        links.set(player.slot, createTrackerLink({
          url: address, slot: player.slot, name: player.name, password: config.password,
          uuid: `${uuid()}-tracker-${player.slot}`, createSocket, onChange,
        }));
      }
    },
    closeAll() {
      for (const link of links.values()) link.close();
      links.clear();
    },
    progressOf: (slot) => links.get(slot)?.progress ?? null,
    isLinked: (slot) => links.get(slot)?.linked === true,
    get size() { return links.size; },
  };
};

export { createTrackerLinks };
export type { TrackerLinks, TrackerLinksDeps };
