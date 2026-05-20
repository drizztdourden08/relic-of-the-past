import { create } from 'zustand';

interface HudSettings {
  heartMode: 'original' | 'smooth';
  magicMode: 'original' | 'accurate';
  countLayout: 'centered' | 'original';
}

interface HudSettingsStore extends HudSettings {
  setHudSettings: (patch: Partial<HudSettings>) => void;
}

const useHudSettingsStore = create<HudSettingsStore>()((set) => ({
  heartMode: 'original',
  magicMode: 'original',
  countLayout: 'centered',
  setHudSettings: (patch) => set(patch),
}));

export { useHudSettingsStore };
export type { HudSettings };
