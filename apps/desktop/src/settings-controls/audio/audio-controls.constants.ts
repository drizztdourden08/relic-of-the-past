/* @layer renderer-app @kind constants */
const CHANNEL_OPTIONS = [
  { value: '1', label: 'Mono' },
  { value: '2', label: 'Stereo' },
];

const FREQ_OPTIONS = [
  { value: '22050', label: '22050' },
  { value: '32000', label: '32000' },
  { value: '44100', label: '44100' },
  { value: '48000', label: '48000' },
];

const MSU_OPTIONS = [
  { value: 'false', label: 'Off' },
  { value: 'true', label: 'MSU' },
  { value: 'deluxe', label: 'Deluxe' },
  { value: 'opuz', label: 'OPUZ' },
  { value: 'deluxe-opuz', label: 'Deluxe OPUZ' },
  { value: 'msul', label: 'MSUL' },
];

const BUFFER_STEPS = [512, 1024, 2048, 4096];
const DEFAULT_BUFFER_STEP = 2;
const DEFAULT_BUFFER_SIZE = 2048;

const AUTO_NOTE = 'Set automatically from the assigned pack. Switch Configuration to Manual to change it.';

const DEVICE_DESCRIPTIONS = {
  audioFreq: {
    auto: `MSU packs are 44100 Hz, OPUZ packs 48000 Hz. ${AUTO_NOTE}`,
    manual: 'Must match the pack format: 44100 Hz for MSU/Deluxe, 48000 Hz for OPUZ/Deluxe OPUZ.',
  },
  audioChannels: {
    auto: `Replacement music is always stereo. ${AUTO_NOTE}`,
    manual: 'Mono collapses the output to one channel; Stereo keeps left and right separate.',
  },
  audioSamples: {
    auto: `Left at a value that is stable on most machines. ${AUTO_NOTE}`,
    manual: 'Smaller buffers reduce latency but may crackle; larger ones are steadier but add delay.',
  },
} as const;

const PACK_DEPENDENT_KEYS = ['resumeMSU', 'resetMSUAtTitle', 'packReplaceAmbient', 'packReplaceSfx'];

const GROUP_VOLUME_KEYS = ['musicVolume', 'ambientVolume', 'sfxVolume'];

const DEVICE_KEYS = ['audioFreq', 'audioChannels', 'audioSamples'];

const VOLUME_ROWS = {
  masterVolume: { label: 'Master Volume', description: 'Controls the overall game volume, so it affects all audio output', mutedKey: null },
  musicVolume: {
    label: 'Music Volume',
    description: 'Sets the music level for the original soundtrack and any music pack alike, since a pack plays in place of it, not alongside it',
    mutedKey: 'musicMuted',
  },
  ambientVolume: {
    label: 'Ambience Volume',
    description: 'Sets the replacement ambient-bed level for rain, waterfalls and wind played by a pack. The sound chip cannot split its own ambience, so this governs replacement audio only',
    mutedKey: 'ambientMuted',
  },
  sfxVolume: { label: 'SFX Volume', description: 'Sets the sound-effects level', mutedKey: 'sfxMuted' },
} as const;

export {
  BUFFER_STEPS, CHANNEL_OPTIONS, DEFAULT_BUFFER_SIZE, DEFAULT_BUFFER_STEP, DEVICE_DESCRIPTIONS, DEVICE_KEYS, FREQ_OPTIONS,
  GROUP_VOLUME_KEYS, MSU_OPTIONS, PACK_DEPENDENT_KEYS, VOLUME_ROWS,
};
