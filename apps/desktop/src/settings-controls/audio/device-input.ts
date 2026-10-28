/* @layer renderer-app @kind logic */
import { createElement } from 'react';
import type { ReactNode } from 'react';
import type { ResolvedAudioConfig } from '@rotp/features';
import { ChoiceControl, SliderControl } from '../inputs';
import { BUFFER_STEPS, CHANNEL_OPTIONS, DEFAULT_BUFFER_SIZE, DEFAULT_BUFFER_STEP, FREQ_OPTIONS } from './audio-controls.constants';
import type { SettingsPatch } from '../settings-controls.type';
import type { DeviceKey } from './audio.type';

const bufferToStep = (value: number): number => {
  const index = BUFFER_STEPS.indexOf(value);
  return index >= 0 ? index : DEFAULT_BUFFER_STEP;
};

const stepToBuffer = (step: number): number => BUFFER_STEPS[step] ?? DEFAULT_BUFFER_SIZE;

const deviceInput = (key: DeviceKey, resolved: ResolvedAudioConfig, onChange: SettingsPatch, disabled: boolean): ReactNode => {
  switch (key) {
    case 'audioFreq':
      return createElement(ChoiceControl, { settingKey: key, look: 'segmented', value: String(resolved.audioFreq), options: FREQ_OPTIONS, onChange: (v: string) => onChange({ audioFreq: Number(v) }), disabled });
    case 'audioChannels':
      return createElement(ChoiceControl, { settingKey: key, look: 'segmented', value: String(resolved.audioChannels), options: CHANNEL_OPTIONS, onChange: (v: string) => onChange({ audioChannels: Number(v) as 1 | 2 }), disabled });
    case 'audioSamples':
      return createElement(SliderControl, {
        settingKey: key, value: bufferToStep(resolved.audioSamples), min: 0, max: BUFFER_STEPS.length - 1, step: 1,
        format: (step: number) => String(stepToBuffer(step)), onChange: (step: number) => onChange({ audioSamples: stepToBuffer(step) }), disabled,
      });
  }
};

export { deviceInput };
