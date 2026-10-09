/* @layer bridge-wasm @kind types */
import type { ApPrintJsonPacket } from '../ap-protocol.type';
import type { PlayerStatus } from '../client-status';

interface Presence {
  onlineOf(slot: number): boolean | null;
  statusOf(slot: number): PlayerStatus;
  handlePrint(packet: ApPrintJsonPacket, team: number | null): boolean;
  setOnline(slot: number, online: boolean): void;
  setStatus(slot: number, value: unknown, seed: boolean): void;
  clear(): void;
}

export type { Presence };
