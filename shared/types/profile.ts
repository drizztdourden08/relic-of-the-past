/* @layer shared-types @kind logic */
import type { RandomizerOptionsSnapshot } from '../randomizer/ap-world/options.type';
import type { GameSettings } from './settings';

/**
 * Randomizer configuration recorded on a profile at creation time. Frozen from
 * then on: updateProfile deliberately never patches it, so the seed, options and
 * any settings it pins stay exactly as the profile was created.
 *
 * `options` is the full frozen catalog snapshot (schema 'ap-options-v2').
 * Profiles created before the snapshot existed carry the old
 * { mode, accessibility, randomizedKinds } shape on disk. Readers go through
 * normalizeRandomizerOptions (shared/randomizer/options-snapshot.ts), which
 * accepts both.
 */
interface ProfileRandomizerConfig {
  mode: 'local' | 'online';
  seed: string;
  options: RandomizerOptionsSnapshot;
  serverUrl?: string;
  slotName?: string;
  /** Settings pinned by the randomizer. The settings UI locks these keys. */
  frozenSettings?: Partial<GameSettings>;
}

interface Profile {
  id: string;
  name: string;
  romFile: string;
  created: number;
  lastPlayed: number;
  language?: string;   // language code (e.g. 'en', 'de', 'fr')
  msuPack?: string;    // MSU pack directory name
  automation?: boolean; // created by `wt new` for a named instance, not a person, so safe to prune
  randomizer?: ProfileRandomizerConfig; // set at creation only; never patched afterwards
}

/** Options object accepted by every createProfile implementation (shared store, IPC, renderer). */
interface CreateProfileOptions {
  name: string;
  romFile: string;
  language?: string;
  msuPack?: string;
  randomizer?: ProfileRandomizerConfig;
  /** Config values a creation-form preset (Vanilla/Enhanced) seeds the profile with, freely editable after. */
  initialConfig?: Partial<GameSettings>;
}

/** Outcome of the app-level create flow, surfaced to the creation form. */
type CreateProfileResult =
  | { success: true; profile: Profile }
  | { success: false; error: string };

/**
 * A profile edit. Three cases, and the middle one used to be unreachable: an ABSENT key leaves the
 * field alone, NULL clears it, a value sets it. Clearing was written as `undefined`, which is
 * indistinguishable from absent once the patch has crossed a process boundary. Choosing "None"
 * for a pack or a language therefore kept whatever was already assigned.
 */
interface ProfilePatch {
  name?: string;
  language?: string | null;
  msuPack?: string | null;
}

interface AppState {
  lastProfileId: string | null;
}

export type { AppState, CreateProfileOptions, CreateProfileResult, Profile, ProfilePatch, ProfileRandomizerConfig };
