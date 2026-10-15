/* @layer renderer-stores @kind types */
interface HudSettings {
  mode: 'original' | 'enhanced';
  style: 'vanilla' | 'enhanced' | 'modern';
  ratio: 'match' | '4:3' | '3:2' | '16:9' | '16:10' | 'custom';
  customW: number;
  customH: number;
  enhancedParts: ('main' | 'pause')[];
  heartMode: 'original' | 'smooth';
  magicMode: 'original' | 'accurate';
  countLayout: 'centered' | 'original';
  countdownStyle: 'pixel' | 'smooth';
  showMaxInYellow: boolean;
}

interface HudSettingsStore extends HudSettings {
  setHudSettings: (patch: Partial<HudSettings>) => void;
}

export type { HudSettingsStore };
