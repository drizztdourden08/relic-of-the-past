// ─── Check Types ───

export type CheckType =
  | 'chest'
  | 'npc'
  | 'standing'
  | 'boss'
  | 'prize'
  | 'keyDrop'
  | 'potItem'
  | 'dig'
  | 'bonk'
  | 'event';

export type RegionType = 'lightWorld' | 'darkWorld' | 'dungeon' | 'cave';

export interface CheckDefinition {
  id: string;
  name: string;
  type: CheckType;
  region: string;
  dungeon?: string;
  vanillaItem?: string;
  /** SRAM room index for chest-open flag tracking */
  roomId?: number;
  /** Chest index within the room (0-5, maps to bits 0x100-0x2000) */
  chestIndex?: number;
}

export interface RegionDefinition {
  id: string;
  name: string;
  type: RegionType;
  dungeon?: string;
}

export interface RegionConnection {
  from: string;
  to: string;
  entrance: string;
}

// ─── Requirement Expression Tree ───

export type Requirement =
  | string
  | { and: Requirement[] }
  | { or: Requirement[] }
  | { count: [string, number] };

// ─── Tracker State ───

export interface CheckState {
  completed: boolean;
  timestamp?: number;
}

export interface TrackerState {
  profileId: string;
  checks: Record<string, CheckState>;
  inventory: string[];
  startedAt: number;
}
