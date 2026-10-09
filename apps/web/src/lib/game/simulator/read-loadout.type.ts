/* @layer bridge-wasm @kind types */
interface DungeonItems {
  dungeonIndex: number;
  name: string;
  map: boolean;
  compass: boolean;
  bigKey: boolean;
}

interface Loadout {
  hearts: { current: number; capacity: number; pieces: number };
  magic: { current: number; halfMagic: boolean };
  equipment: {
    sword: number; shield: number; armor: number;
    gloves: number; boots: boolean; flippers: boolean; moonPearl: boolean;
  };
  consumables: { rupees: number; bombs: number; arrows: number };
  smallKeysHere: number;
  dungeonItems: DungeonItems[];
  quest: { pendants: number; crystals: number };
  grants: { byItem: Record<string, number>; bySite: number[] };
}

export type { Loadout, DungeonItems };
