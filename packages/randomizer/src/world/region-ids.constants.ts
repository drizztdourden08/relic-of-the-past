/* @layer shared-game @kind data */
import type { RegionId } from '@rotp/game-data';

const REGION = {
  start: 'region-001',
  coldBeeCave: 'region-105',
  potionSeller: 'region-112',
  capacityFairy: 'region-113',
  mountainShop: 'region-128',
  desertPalaceOuter: 'region-164',
  turtleRockTop: 'region-055',
  turtleRockSecondSection: 'region-212',
  eastDarkWorld: 'region-034',
  bigBombShop: 'region-136',
  blacksmithsHut: 'region-091',
  sanctuary: 'region-174',
} as const satisfies Record<string, RegionId>;

export { REGION };
