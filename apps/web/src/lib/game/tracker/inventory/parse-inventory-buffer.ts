/* @layer bridge-wasm @kind logic */
import type { RawInventoryState } from './inventory.type';

const parseInventoryBuffer = (heapU8: Uint8Array, ptr: number): RawInventoryState => {
  return {
    bow: heapU8[ptr],
    boomerang: heapU8[ptr + 1],
    hookshot: heapU8[ptr + 2],
    bombs: heapU8[ptr + 3],
    mushroom: heapU8[ptr + 4],
    fireRod: heapU8[ptr + 5],
    iceRod: heapU8[ptr + 6],
    bombos: heapU8[ptr + 7],
    ether: heapU8[ptr + 8],
    quake: heapU8[ptr + 9],
    lamp: heapU8[ptr + 10],
    hammer: heapU8[ptr + 11],
    flute: heapU8[ptr + 12],
    bugNet: heapU8[ptr + 13],
    book: heapU8[ptr + 14],
    somaria: heapU8[ptr + 15],
    byrna: heapU8[ptr + 16],
    cape: heapU8[ptr + 17],
    mirror: heapU8[ptr + 18],
    gloves: heapU8[ptr + 19],
    boots: heapU8[ptr + 20],
    flippers: heapU8[ptr + 21],
    moonPearl: heapU8[ptr + 22],
    sword: heapU8[ptr + 23],
    shield: heapU8[ptr + 24],
    armor: heapU8[ptr + 25],
    bottle1: heapU8[ptr + 26],
    bottle2: heapU8[ptr + 27],
    bottle3: heapU8[ptr + 28],
    bottle4: heapU8[ptr + 29],
    pendants: heapU8[ptr + 30],
    crystals: heapU8[ptr + 31],
    heartPieces: heapU8[ptr + 32],
    healthCapacity: heapU8[ptr + 33],
    bigKeys: heapU8[ptr + 34] | (heapU8[ptr + 35] << 8),
    bombCapacity: heapU8[ptr + 36],
    bombsEverHeld: heapU8[ptr + 37] !== 0,
    swordAtSmiths: heapU8[ptr + 38],
  };
};

export { parseInventoryBuffer };
