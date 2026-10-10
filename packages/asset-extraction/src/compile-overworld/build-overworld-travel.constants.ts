/* @layer shared-asset-extraction @kind constants */
import type { TravelTable } from './build-overworld-travel.type';

const TRAVEL_SLOT_COUNT = 17;

const BIRD_TRAVEL_COUNT = 9;

const TRAVEL_TABLES: readonly TravelTable[] = [
  { asset: 'kBirdTravel_Map16LoadSrcOff', base: 0x82eb07, signed: false },
  { asset: 'kBirdTravel_ScrollX', base: 0x82eb4b, signed: false },
  { asset: 'kBirdTravel_ScrollY', base: 0x82eb29, signed: false },
  { asset: 'kBirdTravel_LinkXCoord', base: 0x82eb8f, signed: false },
  { asset: 'kBirdTravel_LinkYCoord', base: 0x82eb6d, signed: false },
  { asset: 'kBirdTravel_CameraXScroll', base: 0x82ebd3, signed: false },
  { asset: 'kBirdTravel_CameraYScroll', base: 0x82ebb1, signed: false },
  { asset: 'kBirdTravel_Unk1', base: 0x82ebf5, signed: true },
  { asset: 'kBirdTravel_Unk3', base: 0x82ec17, signed: true },
];

export { BIRD_TRAVEL_COUNT, TRAVEL_SLOT_COUNT, TRAVEL_TABLES };
