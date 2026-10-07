/* @layer shared-types @kind logic */
import type { RandomizerOptionsSnapshot } from '../randomizer/world/options.type';
import type { DeliverableLists } from '../randomizer/world/fill/deliverable-lists';
import type { GameSettings } from './settings';

/**
 * Randomizer configuration recorded on a profile at creation time. The seed, options and
 * any settings it pins are frozen from then on. Only the connection (server, slot,
 * password, DeathLink, tracking) can change afterwards, through a RandomizerConnectionPatch
 * (shared/storage/randomizer-connection-patch.ts), so a wrong password never strands a run.
 *
 * `options` is the full frozen catalog snapshot (schema 'ap-options-v2'). Readers go through
 * normalizeRandomizerOptions (shared/randomizer/options-snapshot.ts), which lays it over the
 * catalog baselines.
 */
interface ProfileRandomizerConfig {
  mode: 'local' | 'online';
  seed: string;
  options: RandomizerOptionsSnapshot;
  serverUrl?: string;
  slotName?: string;
  password?: string;
  deathLink?: boolean;
  /** Open a tracker connection per other player for their checks count; on unless false. */
  trackOtherPlayers?: boolean;
  /** Settings pinned by the randomizer. The settings UI locks these keys. */
  frozenSettings?: Partial<GameSettings>;
  /**
   * The npc, pond and world spots the capability probes proved deliverable at creation
   * (online mode), so the player file randomizes the same spots a local seed does. A profile
   * from before this field keeps those spots vanilla.
   */
  deliverable?: DeliverableLists;
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
  randomizer?: ProfileRandomizerConfig; // set at creation; only its connection is patched afterwards
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
  /** An online profile's connection. Any other randomizer key is refused. */
  randomizerConnection?: RandomizerConnectionPatch;
}

/** The randomizer keys a profile edit may change. An empty or null password clears it. */
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
