/* @layer shared-game @kind logic */
/** Seed data structure for randomizer */
interface SeedData {
  version: string;
  seed: string;
  locations: Record<string, LocationEntry>;
  dungeonPrizes: Record<string, string>;
  goalMode: GoalMode;
  medallions: MedallionConfig;
  entrances?: Record<string, string>;
}

interface LocationEntry {
  item: string;
  player?: number;
}

interface GoalMode {
  type: 'ganon' | 'pedestal' | 'triforce' | 'custom';
  requiredCrystals?: number;
}

interface MedallionConfig {
  mire: 'bombos' | 'ether' | 'quake';
  turtleRock: 'bombos' | 'ether' | 'quake';
}

/** Save file metadata */
interface SaveMeta {
  slot: number;
  name: string;
  seedId: string;
  timestamp: number;
  playTime: number;
}

export type {
  GoalMode,
  LocationEntry,
  MedallionConfig,
  SaveMeta,
  SeedData
};
