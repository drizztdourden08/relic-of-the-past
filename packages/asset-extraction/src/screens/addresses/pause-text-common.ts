/* @layer shared-asset-extraction @kind data */
import type { PauseTable, TableRegion } from '../screen-payload.type';

const PAUSE_TEXT_COMMON: Readonly<Record<Exclude<PauseTable, 'ability' | 'gloves' | 'bow'>, TableRegion>> = {
  bottles: { address: 0x8df449, count: 128 },
  mushroom: { address: 0x8df549, count: 16 },
  flute: { address: 0x8df569, count: 32 },
  mirror: { address: 0x8df5a9, count: 16 },
  items: { address: 0x8df1c9, count: 320 },
  dungeonItems: { address: 0x8ded09, count: 16 },
};

export { PAUSE_TEXT_COMMON };
