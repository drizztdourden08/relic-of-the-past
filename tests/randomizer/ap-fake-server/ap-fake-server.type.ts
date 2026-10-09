/* @layer tests @kind type */
import type { CreateSocket } from '@rotp/randomizer';
import type { ApClientPacket, ApGameData, ApNetworkItem, ApNetworkPlayer, ApServerPacket } from '@rotp/randomizer';

interface FakeTrackedSlot {
  checked: number[];
  missing: number[];
}

interface FakeStorageRoom {
  clientStatus?: Record<number, number>;
  playersReply?: string;
  notified?: Set<string>;
}

interface FakeRoom extends FakeStorageRoom {
  password?: string;
  games: Record<string, ApGameData>;
  items: ApNetworkItem[];
  checked: number[];
  missing: number[];
  players: ApNetworkPlayer[];
  slotInfo: Record<string, { name: string; game: string; type: number; group_members: number[] }>;
  slotData: unknown;
  placements: Record<number, ApNetworkItem>;
  refusedUrls: Set<string>;
  seedName?: string;
  tracked?: Record<string, FakeTrackedSlot>;
}

interface FakeServer {
  readonly createSocket: CreateSocket;
  readonly urls: string[];
  readonly received: ApClientPacket[];
  push(packets: ApServerPacket[]): void;
  pushTracker(name: string, packets: ApServerPacket[]): void;
  trackers(): string[];
  drop(): void;
  of<C extends ApClientPacket['cmd']>(cmd: C): Extract<ApClientPacket, { cmd: C }>[];
}

export type { FakeRoom, FakeServer, FakeStorageRoom, FakeTrackedSlot };
