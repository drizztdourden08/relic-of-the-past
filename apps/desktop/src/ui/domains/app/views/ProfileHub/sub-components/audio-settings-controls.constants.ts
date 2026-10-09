/* @layer renderer-components @kind constants */
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

const MODE_OPTIONS = [
  { value: 'auto', label: 'Auto' },
  { value: 'manual', label: 'Manual' },
];

const BUFFER_STEPS = [512, 1024, 2048, 4096];
const DEFAULT_BUFFER_STEP = 2;
const DEFAULT_BUFFER_SIZE = 2048;

const AUTO_NOTE = 'Set automatically from the assigned pack. Switch Configuration to Manual to change it.';

const PACK_DEPENDENT_KEYS = ['resumeMSU', 'resetMSUAtTitle', 'packReplaceAmbient', 'packReplaceSfx'];

const GROUP_VOLUME_KEYS = ['musicVolume', 'ambientVolume', 'sfxVolume'];

export {
  AUTO_NOTE, BUFFER_STEPS, CHANNEL_OPTIONS, DEFAULT_BUFFER_SIZE, DEFAULT_BUFFER_STEP, FREQ_OPTIONS,
  GROUP_VOLUME_KEYS, MODE_OPTIONS, MSU_OPTIONS, PACK_DEPENDENT_KEYS,
};
