/* @layer tests @kind type */
import type { ApClientPacket, ArchipelagoSocket } from '@drizztdourden08/brock-randomizer/archipelago';
import type { FakeRoom } from './ap-fake-server.type';

interface SocketHandlers {
  open: () => void;
  message: (text: string) => void;
  close: (code: number) => void;
}

interface FakeServerWires {
  room: FakeRoom;
  urls: string[];
  received: ApClientPacket[];
  open: Set<ArchipelagoSocket>;
  handlers: Map<ArchipelagoSocket, SocketHandlers>;
  trackerNames: Map<ArchipelagoSocket, string>;
  live: ArchipelagoSocket | null;
}

export type { FakeServerWires, SocketHandlers };
