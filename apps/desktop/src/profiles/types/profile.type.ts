/* @layer shared-types @kind types */
import type { RandomizerProfileConfig } from '@drizztdourden08/brock-randomizer';
import type { GameSettings } from '@rotp/features';
import '@app/randomizer/rotp-randomizer/rotp-randomizer.augment.type';

type ProfileRandomizerConfig = RandomizerProfileConfig;

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
  | { success: false; error: string; code?: string };

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
