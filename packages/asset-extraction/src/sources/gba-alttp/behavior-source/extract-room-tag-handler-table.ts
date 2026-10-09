/* @layer shared-asset-extraction @kind logic */
import type { GbaRomReader } from '../../../rom/gba-rom';
import { ROOM_TAG_HANDLER_TABLE } from '../palace-metadata';
import type { GbaRoomTagHandlerRecord } from './behavior-source.type';
import { HANDLER_POINTER_BYTES, ROOM_TAG_HANDLER_COUNT, THUMB_BIT } from './behavior-source.constants';

const extractRoomTagHandlerTable = (rom: GbaRomReader): GbaRoomTagHandlerRecord[] => Array.from(
  { length: ROOM_TAG_HANDLER_COUNT },
  (_, tag) => {
    const pointer = rom.romUint32(ROOM_TAG_HANDLER_TABLE + tag * HANDLER_POINTER_BYTES);
    if ((pointer & THUMB_BIT) === 0) throw new Error(`Room tag handler 0x${tag.toString(16)} is not a Thumb pointer`);
    return { tag, thumbAddress: pointer & ~THUMB_BIT };
  },
);

export { extractRoomTagHandlerTable };
