/* @layer shared-types @kind logic */
interface Profile {
  id: string;
  name: string;
  romFile: string;
  created: number;
  lastPlayed: number;
  language?: string;   // language code (e.g. 'en', 'de', 'fr')
  msuPack?: string;    // MSU pack directory name
  automation?: boolean; // created by `wt new` for a named instance, not a person — safe to prune
}

/**
 * A profile edit. Three cases, and the middle one used to be unreachable: an ABSENT key leaves the
 * field alone, NULL clears it, a value sets it. Clearing was written as `undefined`, which is
 * indistinguishable from absent once the patch has crossed a process boundary — so choosing "None"
 * for a pack or a language silently kept whatever was already assigned.
 */
interface ProfilePatch {
  name?: string;
  language?: string | null;
  msuPack?: string | null;
}

interface AppState {
  lastProfileId: string | null;
}

export type { AppState, Profile, ProfilePatch };
