/* @layer shared-asset-extraction @kind data */
import type { StairSlotRequirement } from './second-cartridge-stair-slots.type';

const HUB_ROOM = 0x78;

const MEASURED_STAIR_SLOTS: Readonly<Record<number, readonly StairSlotRequirement[]>> = {
  [HUB_ROOM]: [
    { row: 4, col: 15, attr: 0x34 },
    { row: 4, col: 47, attr: 0x35 },
    { row: 4, col: 31, attr: 0x37 },
  ],
};

export { MEASURED_STAIR_SLOTS };
export type { StairSlotRequirement };
