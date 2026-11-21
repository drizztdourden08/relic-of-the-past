/* @layer renderer-app @kind constants */
import { msg } from '@drizztdourden08/brock-core/i18n';

const CHANNEL_OPTIONS = [
  { value: '1', label: msg('settings-controls:audio.channels.mono') },
  { value: '2', label: msg('settings-controls:audio.channels.stereo') },
];

const FREQ_OPTIONS = [
  { value: '22050', label: '22050' },
  { value: '32000', label: '32000' },
  { value: '44100', label: '44100' },
  { value: '48000', label: '48000' },
];

const MSU_OPTIONS = [
  { value: 'false', label: msg('settings-controls:audio.msu.off') },
  { value: 'true', label: 'MSU' },
  { value: 'deluxe', label: 'Deluxe' },
  { value: 'opuz', label: 'OPUZ' },
  { value: 'deluxe-opuz', label: 'Deluxe OPUZ' },
  { value: 'msul', label: 'MSUL' },
];

const BUFFER_STEPS = [512, 1024, 2048, 4096];
const DEFAULT_BUFFER_STEP = 2;
const DEFAULT_BUFFER_SIZE = 2048;

const DEVICE_DESCRIPTIONS = {
  audioFreq: {
    auto: msg('settings-controls:audio.device.freq.auto'),
    manual: msg('settings-controls:audio.device.freq.manual'),
  },
  audioChannels: {
    auto: msg('settings-controls:audio.device.channels.auto'),
    manual: msg('settings-controls:audio.device.channels.manual'),
  },
  audioSamples: {
    auto: msg('settings-controls:audio.device.samples.auto'),
    manual: msg('settings-controls:audio.device.samples.manual'),
  },
} as const;

const PACK_DEPENDENT_KEYS = ['resumeMSU', 'resetMSUAtTitle', 'packReplaceAmbient', 'packReplaceSfx'];

const GROUP_VOLUME_KEYS = ['musicVolume', 'ambientVolume', 'sfxVolume'];

const DEVICE_KEYS = ['audioFreq', 'audioChannels', 'audioSamples'];

const VOLUME_ROWS = {
  masterVolume: { mutedKey: 'masterMuted' },
  musicVolume: { mutedKey: 'musicMuted' },
  ambientVolume: { mutedKey: 'ambientMuted' },
  sfxVolume: { mutedKey: 'sfxMuted' },
} as const;

export {
  BUFFER_STEPS, CHANNEL_OPTIONS, DEFAULT_BUFFER_SIZE, DEFAULT_BUFFER_STEP, DEVICE_DESCRIPTIONS, DEVICE_KEYS, FREQ_OPTIONS,
  GROUP_VOLUME_KEYS, MSU_OPTIONS, PACK_DEPENDENT_KEYS, VOLUME_ROWS,
};
