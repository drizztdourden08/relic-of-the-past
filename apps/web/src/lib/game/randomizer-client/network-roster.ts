/* @layer bridge-wasm @kind logic */
/**
 * Who is already in the room when the slot is accepted. The server announces joins and
 * parts, never who was there first, so each connection asks twice: a Get of every slot's
 * client status on the team (then SetNotify, so a change arrives as a SetReply), and
 * `!players` once through Say, when there is another player to ask about. The roster settles on the `!players` answer, or after SETTLE_AFTER_MS
 * when none comes; only then do the tracker links open, because a tracker connected to a
 * slot makes the server list that slot as connected. For the same reason a later listing
 * never decides a slot one of this app's tracker links holds.
 */
import { clientStatusKey, slotOfStatusKey } from './client-status';
import { isPlayersReply, rosterOfReply } from './players-reply';
import type { ApClientPacket, ApPrintJsonPacket, ApServerPacket } from './ap-protocol.type';
import type { Presence } from './network-presence';
import type { OnlineRoom } from './online-room';
import type { RosterName } from './players-reply';

const SETTLE_AFTER_MS = 3000;
const PLAYERS_COMMAND = '!players';

interface RosterDeps {
  room: OnlineRoom;
  presence: Presence;
  send(packet: ApClientPacket): void;
  /** One of this app's tracker links is connected to the slot. */
  isLinked(slot: number): boolean;
  /** The roster is in: the tracker links may open. */
  onSettled(): void;
}

interface Roster {
  /** The slot was accepted: ask, once per connection. */
  query(): void;
  /** True when the packet moved a slot's presence or status. */
  received(packet: ApServerPacket): boolean;
  /** The connection closed: the next one asks again. */
  reset(): void;
}

const textOf = (packet: ApPrintJsonPacket): string =>
  (Array.isArray(packet.data) ? packet.data.map((part) => part.text ?? '').join('') : '');

const createRoster = (deps: RosterDeps): Roster => {
  const { room, presence, send, isLinked, onSettled } = deps;
  let queried = false;
  let settled = false;
  let timer: ReturnType<typeof setTimeout> | null = null;

  const others = (): RosterName[] => room.players
    .filter((player) => player.team === (room.team ?? 0) && player.slot !== room.slot)
    .map(({ slot, name }) => ({ slot, name }));

  const settle = (): void => {
    if (settled || !queried) return;
    settled = true;
    if (timer !== null) clearTimeout(timer);
    timer = null;
    onSettled();
  };

  const applyReply = (text: string): void => {
    for (const [slot, online] of rosterOfReply(text, room.team ?? 0, others())) {
      if (!isLinked(slot)) presence.setOnline(slot, online);
    }
    settle();
  };

  const applyStatus = (key: string, value: unknown, seed: boolean): boolean => {
    const slot = slotOfStatusKey(key, room.team ?? 0);
    if (slot === null) return false;
    // This slot's own status is shown too; its presence is the connection's.
    presence.setStatus(slot, value, seed && slot !== room.slot && !isLinked(slot));
    return true;
  };

  return {
    query() {
      if (queried || room.team === null) return;
      queried = true;
      const team = room.team;
      const keys = room.players.filter((player) => player.team === team).map(({ slot }) => clientStatusKey(team, slot));
      if (keys.length > 0) {
        send({ cmd: 'Get', keys });
        send({ cmd: 'SetNotify', keys });
      }
      if (others().length === 0) {
        settle();
        return;
      }
      send({ cmd: 'Say', text: PLAYERS_COMMAND });
      timer = setTimeout(settle, SETTLE_AFTER_MS);
    },
    received(packet) {
      if (packet.cmd === 'Retrieved') {
        let moved = false;
        for (const [key, value] of Object.entries(packet.keys ?? {})) moved = applyStatus(key, value, true) || moved;
        return moved;
      }
      if (packet.cmd === 'SetReply') return applyStatus(packet.key, packet.value, false);
      if (packet.cmd === 'PrintJSON' && packet.type === 'CommandResult' && isPlayersReply(textOf(packet))) {
        applyReply(textOf(packet));
        return true;
      }
      return false;
    },
    reset() {
      if (timer !== null) clearTimeout(timer);
      timer = null;
      queried = false;
      settled = false;
    },
  };
};

export { createRoster, PLAYERS_COMMAND, SETTLE_AFTER_MS };
export type { Roster, RosterDeps };
