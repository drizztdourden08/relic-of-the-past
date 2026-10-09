/* @layer shared-types @kind types */
interface AudioSettings {
  enableAudio: boolean;
  masterVolume: number;
  perGroupVolume: boolean;
  musicVolume: number;
  musicMuted: boolean;
  sfxVolume: number;
  sfxMuted: boolean;
  ambientVolume: number;
  ambientMuted: boolean;
  audioFreq: number;
  audioChannels: 1 | 2;
  audioSamples: number;
  msuConfigMode: 'auto' | 'manual';
  enableMSU: 'false' | 'true' | 'deluxe' | 'opuz' | 'deluxe-opuz' | 'msul';
  resumeMSU: boolean;
  resetMSUAtTitle: boolean;
  packReplaceAmbient: boolean;
  packReplaceSfx: boolean;
}

export type { AudioSettings };
