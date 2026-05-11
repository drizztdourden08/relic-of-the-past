export interface Profile {
  id: string;
  name: string;
  romFile: string;
  created: number;
  lastPlayed: number;
}

export interface AppState {
  lastProfileId: string | null;
}
