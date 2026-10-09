/* @layer bridge-wasm @kind types */
import type { ApClientPacket, ApServerPacket } from '../ap-protocol.type';
import type { Presence } from '../network-presence';
import type { OnlineRoom } from '../online-room';

interface RosterDeps {
  room: OnlineRoom;
  presence: Presence;
  send(packet: ApClientPacket): void;
  isLinked(slot: number): boolean;
  onSettled(): void;
}

interface Roster {
  query(): void;
  received(packet: ApServerPacket): boolean;
  reset(): void;
}

export type { Roster, RosterDeps };
