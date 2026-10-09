/* @layer bridge-wasm @kind logic */
import { itemAt } from '../../checked-access';
import type { RawInventoryState } from './inventory.type';

const parseInventoryBuffer = (heapU8: Uint8Array, ptr: number): RawInventoryState => {
  const at = (offset: number): number => itemAt(heapU8, ptr + offset);
  return {
    bow: at(0),
    boomerang: at(1),
    hookshot: at(2),
    bombs: at(3),
    mushroom: at(4),
    fireRod: at(5),
    iceRod: at(6),
    bombos: at(7),
    ether: at(8),
    quake: at(9),
    lamp: at(10),
    hammer: at(11),
    flute: at(12),
    bugNet: at(13),
    book: at(14),
    somaria: at(15),
    byrna: at(16),
    cape: at(17),
    mirror: at(18),
    gloves: at(19),
    boots: at(20),
    flippers: at(21),
    moonPearl: at(22),
    sword: at(23),
    shield: at(24),
    armor: at(25),
    bottle1: at(26),
    bottle2: at(27),
    bottle3: at(28),
    bottle4: at(29),
    pendants: at(30),
    crystals: at(31),
    heartPieces: at(32),
    healthCapacity: at(33),
    bigKeys: at(34) | (at(35) << 8),
    bombCapacity: at(36),
    bombsEverHeld: at(37) !== 0,
    swordAtSmiths: at(38),
  };
};

export { parseInventoryBuffer };
