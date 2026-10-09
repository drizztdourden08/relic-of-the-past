/* @layer bridge-wasm @kind logic */
import { createTrackerLink } from './tracker-link';
import type { TrackerLink } from './tracker-link';
import type { TrackerLinks, TrackerLinksDeps } from './tracker-links.type';

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
export type { TrackerLinks, TrackerLinksDeps } from './tracker-links.type';
