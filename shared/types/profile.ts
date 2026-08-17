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

interface AppState {
  lastProfileId: string | null;
}

export type { AppState, Profile };
