/* @layer bridge-wasm @kind logic */
/**
 * Who is connected to the room and what each slot's client status says. Three sources feed
 * it: the client status read at connect (client-status.ts), the `!players` line
 * (players-reply.ts), then the room's Join and Part messages. A slot can hold several game
 * clients at once, so each keeps a count and reads online while it is above zero. Trackers
 * and text clients (this app's own tracker links among them) join and part too, but never
 * count: a player is online while a game is.
 */
import { playerStatusOf, statusImpliesOnline } from './client-status';
import type { ApPrintJsonPacket } from './ap-protocol.type';
import type { PlayerStatus } from './client-status';

/** The tags the server calls non-game clients (its _non_game_messages). */
const NON_GAME_TAGS: readonly string[] = ['Tracker', 'TextOnly', 'HintGame'];
/** A non-game client's Part carries no tags; its text says "has stopped tracking" and the like. */
const NON_GAME_PART = / has stopped \w+ the game\b/;

interface Presence {
  /** true, false, or null when the room has not said. */
  onlineOf(slot: number): boolean | null;
  statusOf(slot: number): PlayerStatus;
  /** True when the message changed a slot's count. */
  handlePrint(packet: ApPrintJsonPacket, team: number | null): boolean;
  /** What `!players` listed for the slot. */
  setOnline(slot: number, online: boolean): void;
  /** The slot's client status; `seed`: also decides online while nothing else has. */
  setStatus(slot: number, value: unknown, seed: boolean): void;
  clear(): void;
}

const textOf = (packet: ApPrintJsonPacket): string =>
  (Array.isArray(packet.data) ? packet.data.map((part) => part.text ?? '').join('') : '');

const isNonGameClient = (packet: ApPrintJsonPacket): boolean => (packet.type === 'Join'
  ? (packet.tags ?? []).some((tag) => NON_GAME_TAGS.includes(tag))
  : NON_GAME_PART.test(textOf(packet)));

const createPresence = (): Presence => {
  const counts = new Map<number, number>();
  const statuses = new Map<number, PlayerStatus>();

  return {
    onlineOf(slot) {
      const count = counts.get(slot);
      return count === undefined ? null : count > 0;
    },
    statusOf: (slot) => statuses.get(slot) ?? 'unknown',
    handlePrint(packet, team) {
      if (packet.type !== 'Join' && packet.type !== 'Part') return false;
      if (typeof packet.slot !== 'number') return false;
      if (team !== null && typeof packet.team === 'number' && packet.team !== team) return false;
      if (isNonGameClient(packet)) return false;
      const count = counts.get(packet.slot) ?? 0;
      counts.set(packet.slot, Math.max(0, count + (packet.type === 'Join' ? 1 : -1)));
      return true;
    },
    setOnline(slot, online) {
      counts.set(slot, online ? Math.max(1, counts.get(slot) ?? 0) : 0);
    },
    setStatus(slot, value, seed) {
      const status = playerStatusOf(value);
      statuses.set(slot, status);
      const implied = statusImpliesOnline(status);
      // A key the server did not fill (null) says nothing about presence.
      if (seed && typeof value === 'number' && implied !== null && !counts.has(slot)) counts.set(slot, implied ? 1 : 0);
    },
    clear: () => {
      counts.clear();
      statuses.clear();
    },
  };
};

export { createPresence, isNonGameClient };
export type { Presence };
