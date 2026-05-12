export interface Profile {
  id: string;
  name: string;
  romFile: string;
  created: number;
  lastPlayed: number;
  language?: string;   // language code (e.g. 'en', 'de', 'fr')
  msuPack?: string;    // MSU pack directory name
}

export interface AppState {
  lastProfileId: string | null;
}
