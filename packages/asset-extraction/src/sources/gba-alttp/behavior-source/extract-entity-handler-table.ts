/* @layer shared-asset-extraction @kind logic */
import type { GbaRomReader } from '../../../rom/gba-rom';
import type { GbaEntityHandlerRecord } from './behavior-source.type';
import {
  ENTITY_HANDLER_COUNT, ENTITY_HANDLER_TABLE, HANDLER_POINTER_BYTES, THUMB_BIT,
} from './behavior-source.constants';

const extractEntityHandlerTable = (rom: GbaRomReader): GbaEntityHandlerRecord[] => Array.from(
  { length: ENTITY_HANDLER_COUNT },
  (_, type) => {
    const pointer = rom.romUint32(ENTITY_HANDLER_TABLE + type * HANDLER_POINTER_BYTES);
    if ((pointer & THUMB_BIT) === 0) throw new Error(`Entity handler 0x${type.toString(16)} is not a Thumb pointer`);
    return { type, thumbAddress: pointer & ~THUMB_BIT };
  },
);

export { extractEntityHandlerTable };
