/* @layer shared-game @kind types */

interface RomMouth {
  table: 'entrance' | 'hole';
  slot: number;
  entranceId: number;
  area: number;
  screen: number;
  x: number;
  y: number;
}

interface RomExit {
  index: number;
  room: number;
  screenIndex: number;
  x: number;
  y: number;
}

interface RomRoomTravel {
  holeDest: number;
  stairDest: readonly number[];
  tags: readonly number[];
}

interface RomNativeTables {
  areaHeads: readonly number[];
  entranceRooms: readonly number[];
  entrancePalaces: readonly number[];
  mouths: readonly RomMouth[];
  exits: readonly RomExit[];
  isAreaHead: (area: number) => boolean;
  headOf: (area: number) => number;
  roomTravel: (room: number) => RomRoomTravel;
  palaceOfRoom: ReadonlyMap<number, number>;
}

export type { RomExit, RomMouth, RomNativeTables, RomRoomTravel };
