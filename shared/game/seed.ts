/** Seed data structure for randomizer */
export interface SeedData {
  version: string;
  seed: string;
  locations: Record<string, LocationEntry>;
  dungeonPrizes: Record<string, string>;
  goalMode: GoalMode;
  medallions: MedallionConfig;
  entrances?: Record<string, string>;
}

export interface LocationEntry {
  item: string;
  player?: number;
}

export interface GoalMode {
  type: 'ganon' | 'pedestal' | 'triforce' | 'custom';
  requiredCrystals?: number;
}

export interface MedallionConfig {
  mire: 'bombos' | 'ether' | 'quake';
  turtleRock: 'bombos' | 'ether' | 'quake';
}

/** Save file metadata */
export interface SaveMeta {
  slot: number;
  name: string;
  seedId: string;
  timestamp: number;
  playTime: number;
}
