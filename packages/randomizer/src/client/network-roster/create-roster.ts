/* @layer bridge-wasm @kind logic */
import { clientStatusKey } from '../client-status';
import { isPlayersReply, rosterOfReply } from '../players-reply';
import type { ApPrintJsonPacket } from '../ap-protocol.type';
import { applyRosterStatus } from './apply-roster-status';
import { PLAYERS_COMMAND, SETTLE_AFTER_MS } from './network-roster.constants';
import { othersOf } from './others-of';
import type { Roster, RosterDeps } from './network-roster.type';

const textOf = (packet: ApPrintJsonPacket): string =>
  (Array.isArray(packet.data) ? packet.data.map((part) => part.text ?? '').join('') : '');

const createRoster = (deps: RosterDeps): Roster => {
  const { room, presence, send, isLinked, onSettled } = deps;
  let queried = false;
  let settled = false;
  let timer: ReturnType<typeof setTimeout> | null = null;

  const settle = (): void => {
    if (settled || !queried) return;
    settled = true;
    if (timer !== null) clearTimeout(timer);
    timer = null;
    onSettled();
  };

  const applyReply = (text: string): void => {
    for (const [slot, online] of rosterOfReply(text, room.team ?? 0, othersOf(room))) {
      if (!isLinked(slot)) presence.setOnline(slot, online);
    }
    settle();
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
      if (othersOf(room).length === 0) {
        settle();
        return;
      }
      send({ cmd: 'Say', text: PLAYERS_COMMAND });
      timer = setTimeout(settle, SETTLE_AFTER_MS);
    },
    received(packet) {
      if (packet.cmd === 'Retrieved') {
        let moved = false;
        for (const [key, value] of Object.entries(packet.keys ?? {})) moved = applyRosterStatus(deps, key, value, true) || moved;
        return moved;
      }
      if (packet.cmd === 'SetReply') return applyRosterStatus(deps, packet.key, packet.value, false);
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

export { createRoster };
