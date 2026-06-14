/* @layer bridge-wasm @kind logic */
/**
 * Inventory state parsing — reads the 34-byte WASM buffer from
 * WasmGetInventoryState() and converts it into a Set<string> of
 * tracker-compatible item names.
 */

interface RawInventoryState {
  bow: number;
  boomerang: number;
  hookshot: number;
  bombs: number;
  mushroom: number;
  fireRod: number;
  iceRod: number;
  bombos: number;
  ether: number;
  quake: number;
  lamp: number;
  hammer: number;
  flute: number;
  bugNet: number;
  book: number;
  somaria: number;
  byrna: number;
  cape: number;
  mirror: number;
  gloves: number;
  boots: number;
  flippers: number;
  moonPearl: number;
  sword: number;
  shield: number;
  armor: number;
  bottle1: number;
  bottle2: number;
  bottle3: number;
  bottle4: number;
  pendants: number;
  crystals: number;
  heartPieces: number;
  healthCapacity: number;
}

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
  };
};

const inventoryToItemSet = (raw: RawInventoryState): Set<string> => {
  const items = new Set<string>();

  // Sword progression
  if (raw.sword >= 4) items.add('Golden Sword');
  if (raw.sword >= 3) items.add('Tempered Sword');
  if (raw.sword >= 2) items.add('Master Sword');
  if (raw.sword >= 1) items.add('Fighter Sword');

  // Shield progression
  if (raw.shield >= 3) items.add('Mirror Shield');
  if (raw.shield >= 2) items.add('Fire Shield');
  if (raw.shield >= 1) items.add('Fighters Shield');

  // Armor
  if (raw.armor >= 2) items.add('Red Mail');
  if (raw.armor >= 1) items.add('Blue Mail');

  // Glove progression
  if (raw.gloves >= 2) items.add('Titans Mitts');
  if (raw.gloves >= 1) items.add('Power Glove');

  // Bow
  if (raw.bow >= 3) { items.add('Silver Bow'); items.add('Bow'); }
  else if (raw.bow >= 1) items.add('Bow');

  // Boomerang
  if (raw.boomerang === 2) items.add('Red Boomerang');
  else if (raw.boomerang === 1) items.add('Blue Boomerang');

  // Simple flags
  if (raw.hookshot) items.add('Hookshot');
  if (raw.bombs) items.add('Bombs');
  if (raw.fireRod) items.add('Fire Rod');
  if (raw.iceRod) items.add('Ice Rod');
  if (raw.bombos) items.add('Bombos');
  if (raw.ether) items.add('Ether');
  if (raw.quake) items.add('Quake');
  if (raw.lamp) items.add('Lamp');
  if (raw.hammer) items.add('Hammer');
  if (raw.bugNet) items.add('Bug Catching Net');
  if (raw.book) items.add('Book of Mudora');
  if (raw.somaria) items.add('Cane of Somaria');
  if (raw.byrna) items.add('Cane of Byrna');
  if (raw.cape) items.add('Cape');
  if (raw.mirror >= 2) items.add('Magic Mirror');
  if (raw.boots) items.add('Pegasus Boots');
  if (raw.flippers) items.add('Flippers');
  if (raw.moonPearl) items.add('Moon Pearl');

  // Mushroom/Powder
  if (raw.mushroom === 1) items.add('Mushroom');
  else if (raw.mushroom === 2) items.add('Magic Powder');

  // Flute/Shovel
  if (raw.flute >= 3) items.add('Activated Flute');
  else if (raw.flute === 2) items.add('Flute');
  else if (raw.flute === 1) items.add('Shovel');

  // Bottles
  const bottleSlots = [raw.bottle1, raw.bottle2, raw.bottle3, raw.bottle4];
  for (const b of bottleSlots) {
    if (b > 0) items.add('Bottle');
    if (b === 2) items.add('Bottle (Red Potion)');
    if (b === 3) items.add('Bottle (Green Potion)');
    if (b === 4) items.add('Bottle (Blue Potion)');
    if (b === 5) items.add('Bottle (Fairy)');
    if (b === 6) items.add('Bottle (Bee)');
    if (b === 7) items.add('Bottle (Good Bee)');
  }

  // Pendants (bitmask)
  if (raw.pendants & 0x04) items.add('Green Pendant');
  if (raw.pendants & 0x02) items.add('Red Pendant');
  if (raw.pendants & 0x01) items.add('Blue Pendant');

  // Crystals (bitmask)
  const crystalBits = [
    [0x02, 'Crystal 1'], [0x10, 'Crystal 2'], [0x40, 'Crystal 3'],
    [0x20, 'Crystal 4'], [0x04, 'Crystal 5'], [0x01, 'Crystal 6'],
    [0x08, 'Crystal 7'],
  ] as const;
  for (const [bit, name] of crystalBits) {
    if (raw.crystals & bit) items.add(name);
  }

  return items;
};

const progressToEvents = (heapU8: Uint8Array, progPtr: number): string[] => {
  const events: string[] = [];
  const progressIndicator = heapU8[progPtr];       // index 0
  const sleepState = heapU8[progPtr + 12];         // index 12

  // Link wakes up: either got out of bed this session (sleepState >= 2)
  // or already past uncle in a loaded save (progressIndicator >= 1)
  if (sleepState >= 2 || progressIndicator >= 1) events.push('Link Wakes Up');
  // progress_indicator >= 1 means Uncle gave sword, you're in the castle
  if (progressIndicator >= 1) events.push('Zelda Rescue Started');
  // progress_indicator >= 2 means Zelda reached Sanctuary, rain stops
  if (progressIndicator >= 2) events.push('Rescued Zelda');
  // progress_indicator >= 3 means escaped dungeon, full game
  if (progressIndicator >= 3) events.push('Rescued Old Man');

  return events;
};

const setsEqual = (a: Set<string>, b: Set<string>): boolean => {
  if (a.size !== b.size) return false;
  for (const item of a) {
    if (!b.has(item)) return false;
  }
  return true;
};

export {
  inventoryToItemSet,
  parseInventoryBuffer,
  progressToEvents,
  setsEqual
};
export type { RawInventoryState };
