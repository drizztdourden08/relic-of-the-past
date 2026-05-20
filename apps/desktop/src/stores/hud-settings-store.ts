import { create } from 'zustand';

interface HudSettings {
  mode: 'original' | 'enhanced';
  style: 'vanilla' | 'modern';
  ratio: 'match' | '4:3' | '3:2' | '16:9' | '16:10' | '18:9';
  heartMode: 'original' | 'smooth';
  magicMode: 'original' | 'accurate';
  countLayout: 'centered' | 'original';
}

interface HudSettingsStore extends HudSettings {
  setHudSettings: (patch: Partial<HudSettings>) => void;
}

const useHudSettingsStore = create<HudSettingsStore>()((set) => ({
  mode: 'original',
  style: 'vanilla',
  ratio: 'match',
  heartMode: 'original',
  magicMode: 'original',
  countLayout: 'centered',
  setHudSettings: (patch) => set(patch),
}));

export { useHudSettingsStore };
export type { HudSettings };
