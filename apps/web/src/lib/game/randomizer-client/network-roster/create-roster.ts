/* @layer bridge-wasm @kind logic */
import { clientStatusKey, slotOfStatusKey } from '../client-status';
import { isPlayersReply, rosterOfReply } from '../players-reply';
import type { ApPrintJsonPacket } from '../ap-protocol.type';
import type { RosterName } from '../players-reply';
import { PLAYERS_COMMAND, SETTLE_AFTER_MS } from './network-roster.constants';
import type { Roster, RosterDeps } from './network-roster.type';

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
    const presenceIsOwnConnection = slot === room.slot;
    presence.setStatus(slot, value, seed && !presenceIsOwnConnection && !isLinked(slot));
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

export { createRoster };
