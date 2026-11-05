/* @layer tests @kind helper */
import { OW_EVENT_BASE, ROOM_FLAGS_BASE } from '@rotp/game-core';

const SRAM_BYTES = 0x2000;
const SLOT_BYTES = 0x500;
const SLOT_WORDS = 0x280;
const VALID_CHECKSUM = 0x5a5a;
const ROOM_COUNT = 0x128;
const OW_SCREEN_COUNT = 0x40;

interface TraceSlot {
  slot: number;
  stride: number;
  roomWord: number;
  owByte: number;
}

const wordAt = (bytes: Uint8Array, offset: number): number => (bytes[offset] ?? 0) | ((bytes[offset + 1] ?? 0) << 8);

const writeSlot = (bytes: Uint8Array, { slot, stride, roomWord, owByte }: TraceSlot): void => {
  const base = slot * SLOT_BYTES;
  for (let room = 0; room < ROOM_COUNT; room += stride) {
    bytes[base + ROOM_FLAGS_BASE + room * 2] = roomWord & 0xff;
    bytes[base + ROOM_FLAGS_BASE + room * 2 + 1] = roomWord >> 8;
  }
  for (let screen = 0; screen < OW_SCREEN_COUNT; screen += stride) bytes[base + OW_EVENT_BASE + screen] = owByte;
  let sum = 0;
  for (let word = 0; word < SLOT_WORDS - 1; word++) sum += wordAt(bytes, base + word * 2);
  const last = (VALID_CHECKSUM - sum) & 0xffff;
  bytes[base + (SLOT_WORDS - 1) * 2] = last & 0xff;
  bytes[base + (SLOT_WORDS - 1) * 2 + 1] = last >> 8;
};

const buildTraceSram = (slots: readonly TraceSlot[]): ArrayBuffer => {
  const bytes = new Uint8Array(SRAM_BYTES);
  for (const slot of slots) writeSlot(bytes, slot);
  return bytes.buffer;
};

export type { TraceSlot };
export { buildTraceSram };
