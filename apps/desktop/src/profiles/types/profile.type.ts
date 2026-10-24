/* @layer shared-types @kind types */
import type { RandomizerOptionsSnapshot, DeliverableLists } from '@rotp/randomizer';
import type { GameSettings } from '@rotp/features';

interface ProfileRandomizerConfig {
  mode: 'local' | 'online' | 'archipelia';
  origin?: 'archipelia';
  seed: string;
  options: RandomizerOptionsSnapshot;
  serverUrl?: string;
  slotName?: string;
  password?: string;
  deathLink?: boolean;
  trackOtherPlayers?: boolean;
  frozenSettings?: Partial<GameSettings>;
  deliverable?: DeliverableLists;
}

interface Profile {
  id: string;
  name: string;
  romFile: string;
  created: number;
  lastPlayed: number;
  language?: string;
  msuPack?: string;
  automation?: boolean;
  randomizer?: ProfileRandomizerConfig;
}

interface CreateProfileOptions {
  name: string;
  romFile: string;
  language?: string;
  msuPack?: string;
  randomizer?: ProfileRandomizerConfig;
  initialConfig?: Partial<GameSettings>;
}

type CreateProfileResult =
  | { success: true; profile: Profile }
  | { success: false; error: string };

interface ProfilePatch {
  name?: string;
  language?: string | null;
  msuPack?: string | null;
  randomizerConnection?: RandomizerConnectionPatch;
}

interface RandomizerConnectionPatch {
  serverUrl?: string;
  slotName?: string;
  password?: string | null;
  deathLink?: boolean;
  trackOtherPlayers?: boolean;
}

interface AppState {
  lastProfileId: string | null;
}

export type {
  AppState, CreateProfileOptions, CreateProfileResult, Profile, ProfilePatch, ProfileRandomizerConfig,
  RandomizerConnectionPatch,
};
