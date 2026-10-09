/* @layer bridge-wasm @kind logic */
import type { NameTables } from './ap-names';
import type { PlayerStatus } from './client-status';
import type { NetworkPlayer } from './network-status.type';
import type { OnlineRoom } from './online-room';
import type { Presence } from './network-presence';
import type { TrackerLinks } from './tracker-links';

const shownStatus = (status: PlayerStatus, online: boolean | null): PlayerStatus =>
  (online === false && status !== 'goal' ? 'unknown' : status);

const buildNetworkPlayers = (
  room: OnlineRoom,
  names: NameTables,
  presence: Pick<Presence, 'onlineOf' | 'statusOf'>,
  trackers: Pick<TrackerLinks, 'progressOf'>,
): NetworkPlayer[] => {
  const team = room.team ?? 0;
  return room.players
    .filter((player) => player.team === team)
    .map((player) => {
      const self = player.slot === room.slot;
      const online = self ? room.connected : presence.onlineOf(player.slot);
      const progress = self
        ? { checked: room.checked.size, total: room.checked.size + room.missing.size }
        : trackers.progressOf(player.slot);
      return {
        slot: player.slot,
        name: player.name,
        alias: player.alias || player.name,
        game: names.gameOf(player.slot) ?? null,
        online,
        status: shownStatus(presence.statusOf(player.slot), online),
        self,
        checked: progress?.checked ?? null,
        total: progress?.total ?? null,
      };
    })
    .sort((a, b) => a.slot - b.slot);
};

export { buildNetworkPlayers };
