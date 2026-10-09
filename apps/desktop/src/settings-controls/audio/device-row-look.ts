/* @layer renderer-app @kind logic */
import type { ResolvedAudioConfig } from '@shared/features/msu-auto-config';
import type { GameSettings } from '@shared/types/settings';
import { BUFFER_STEPS, CHANNEL_OPTIONS, DEFAULT_BUFFER_SIZE, DEFAULT_BUFFER_STEP, DEVICE_DESCRIPTIONS, FREQ_OPTIONS } from './audio-controls.constants';
import type { SettingsPatch } from '../settings-controls.type';
import type { DeviceKey, DeviceRowLook } from './audio.type';

const bufferToStep = (value: number): number => {
  const index = BUFFER_STEPS.indexOf(value);
  return index >= 0 ? index : DEFAULT_BUFFER_STEP;
};

const stepToBuffer = (step: number): number => BUFFER_STEPS[step] ?? DEFAULT_BUFFER_SIZE;

const deviceRowLook = (key: DeviceKey, settings: GameSettings, resolved: ResolvedAudioConfig, onChange: SettingsPatch): DeviceRowLook => {
  const description = DEVICE_DESCRIPTIONS[key][settings.msuConfigMode === 'auto' ? 'auto' : 'manual'];
  switch (key) {
    case 'audioFreq':
      return { description, input: { kind: 'segmented', value: String(resolved.audioFreq), options: FREQ_OPTIONS, onChange: (v) => onChange({ audioFreq: Number(v) }) } };
    case 'audioChannels':
      return { description, input: { kind: 'segmented', value: String(resolved.audioChannels), options: CHANNEL_OPTIONS, onChange: (v) => onChange({ audioChannels: Number(v) as 1 | 2 }) } };
    case 'audioSamples':
      return {
        description,
        input: {
          kind: 'slider', value: bufferToStep(resolved.audioSamples), min: 0, max: BUFFER_STEPS.length - 1, step: 1,
          formatValue: (step) => String(stepToBuffer(step)), onChange: (step) => onChange({ audioSamples: stepToBuffer(step) }),
        },
      };
  }
};

export { deviceRowLook };
