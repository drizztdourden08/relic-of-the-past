/* @layer tests @kind type */
import type { ApClientPacket, ApSocket } from '@rotp/randomizer';
import type { FakeRoom } from './ap-fake-server.type';

interface FakeServerWires {
  room: FakeRoom;
  urls: string[];
  received: ApClientPacket[];
  open: Set<ApSocket>;
  trackerNames: Map<ApSocket, string>;
  live: ApSocket | null;
}

export type { FakeServerWires };
