/* @layer renderer-components @kind constants */
import type { SettingsSection } from './settings-sections.type';

const percent = (v: unknown): string => `${v ?? 100}%`;

const AUDIO_SECTION: SettingsSection = {
  title: 'Audio',
  keys: [
    { key: 'enableAudio', label: 'Audio' },
    { key: 'masterVolume', label: 'Master volume', format: percent },
    { key: 'musicVolume', label: 'Music volume', format: percent },
    { key: 'sfxVolume', label: 'Effects volume', format: percent },
    { key: 'ambientVolume', label: 'Ambient volume', format: percent },
    { key: 'audioFreq', label: 'Audio frequency', format: (v) => `${v ?? 44100} Hz` },
    { key: 'audioChannels', label: 'Audio channels', format: (v) => (v === 1 ? 'Mono' : 'Stereo') },
    { key: 'audioSamples', label: 'Audio samples', format: (v) => String(v ?? 2048) },
  ],
};

const MSU_SECTION: SettingsSection = {
  title: 'MSU',
  keys: [
    { key: 'msuConfigMode', label: 'MSU configuration', format: (v) => (v === 'manual' ? 'Manual' : 'Auto') },
    { key: 'enableMSU', label: 'MSU audio', format: (v) => (v === 'false' || !v ? 'Off' : String(v)) },
    { key: 'resumeMSU', label: 'Resume MSU' },
    { key: 'resetMSUAtTitle', label: 'Reset MSU at title' },
    { key: 'packReplaceAmbient', label: 'Pack replaces ambient' },
    { key: 'packReplaceSfx', label: 'Pack replaces effects' },
  ],
};

const CONTROLS_SECTION: SettingsSection = {
  title: 'Controls',
  keys: [
    { key: 'mapOnSelect', label: 'Map on Select' },
    { key: 'hapticsEnabled', label: 'Haptics' },
  ],
};

export { AUDIO_SECTION, CONTROLS_SECTION, MSU_SECTION };
