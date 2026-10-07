/* @layer shared-asset-extraction @kind logic */
import type { GbaRomReader } from '../../rom/gba-rom';
import { ROOM_TAG_HANDLER_TABLE } from './palace-metadata';

const ENTITY_HANDLER_TABLE = 0x08174148;
const ENTITY_HANDLER_COUNT = 0xf8;
const ROOM_TAG_HANDLER_COUNT = 0x43;

interface GbaEntityHandlerRecord {
  type: number;
  thumbAddress: number;
}

interface GbaRoomTagHandlerRecord {
  tag: number;
  thumbAddress: number;
}

const extractEntityHandlerTable = (rom: GbaRomReader): GbaEntityHandlerRecord[] => Array.from(
  { length: ENTITY_HANDLER_COUNT },
  (_, type) => {
    const pointer = rom.romUint32(ENTITY_HANDLER_TABLE + type * 4);
    if ((pointer & 1) === 0) throw new Error(`Entity handler 0x${type.toString(16)} is not a Thumb pointer`);
    return { type, thumbAddress: pointer & ~1 };
  },
);

const extractRoomTagHandlerTable = (rom: GbaRomReader): GbaRoomTagHandlerRecord[] => Array.from(
  { length: ROOM_TAG_HANDLER_COUNT },
  (_, tag) => {
    const pointer = rom.romUint32(ROOM_TAG_HANDLER_TABLE + tag * 4);
    if ((pointer & 1) === 0) throw new Error(`Room tag handler 0x${tag.toString(16)} is not a Thumb pointer`);
    return { tag, thumbAddress: pointer & ~1 };
  },
);

export {
  ENTITY_HANDLER_COUNT,
  ENTITY_HANDLER_TABLE,
  ROOM_TAG_HANDLER_COUNT,
  extractEntityHandlerTable,
  extractRoomTagHandlerTable,
};
export type { GbaEntityHandlerRecord, GbaRoomTagHandlerRecord };
