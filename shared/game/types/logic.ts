/* @layer shared-game @kind types */
// ─── Tracker State ───

interface CheckState {
  completed: boolean;
  timestamp?: number;
}

interface TrackerState {
  profileId: string;
  checks: Record<string, CheckState>;
  inventory: string[];
  startedAt: number;
}

// ─── Logic Configuration ───

type LogicMode = 'vanilla' | 'open' | 'inverted' | 'no-logic';
type SwordMode = 'normal' | 'swordless' | 'assured';
type Goal = 'ganon' | 'pedestal' | 'triforce-hunt' | 'crystals' | 'bosses';

interface LogicConfig {
  mode: LogicMode;
  /** Screen ID where the game starts (default: 'menu') */
  startingScreen: string;
  /** Items the player has at game start (e.g. open mode gives Bombs free) */
  startingItems: string[];
  /** S&Q destinations freely available from Menu (screen IDs) */
  saveQuitDestinations: string[];
  /** Whether Moon Pearl is required to be human in DW */
  moonPearlRequired: boolean;
  /** Medallion requirements (randomized per seed) */
  medallionRequirements: {
    miseryMire: 'Ether' | 'Bombos' | 'Quake';
    turtleRock: 'Ether' | 'Bombos' | 'Quake';
  };
  /** Crystals needed to enter Ganon's Tower */
  crystalsForGT: number;
  /** Crystals needed to damage Ganon */
  crystalsForGanon: number;
  /** Pendants needed for Master Sword Pedestal */
  pendantsForPedestal: number;
  /** Sword mode */
  swordMode: SwordMode;
  /** Game goal */
  goal: Goal;
  /** Whether overworld entrances are shuffled */
  overworldShuffle: boolean;
  /** Whether dungeon entrances are shuffled */
  dungeonShuffle: boolean;
  /** Whether small keys are in the general item pool */
  keysanity: boolean;
  /** Whether big keys are in the general item pool */
  bigKeyShuffle: boolean;
}

export type {
  CheckState,
  Goal,
  LogicConfig,
  LogicMode,
  SwordMode,
  TrackerState,
};
