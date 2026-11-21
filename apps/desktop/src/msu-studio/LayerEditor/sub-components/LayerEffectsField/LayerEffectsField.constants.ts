/* @layer renderer-components @kind constants */
import { msg } from '@drizztdourden08/brock-core/i18n';
import type { LayerEffect } from '@rotp/game-data';
import type { EffectChoice, EffectPreset } from './LayerEffectsField.type';

const PRESETS: EffectPreset[] = [
  {
    id: 'muffled',
    label: msg('msu-studio:layers.effects.preset.muffled'),
    description: msg('msu-studio:layers.effects.preset.muffled-hint'),
    effects: [{ kind: 'lowpass', frequencyHz: 900 }, { kind: 'eq', lowDb: 2, midDb: -2, highDb: -6 }],
  },
  {
    id: 'distant',
    label: msg('msu-studio:layers.effects.preset.distant'),
    description: msg('msu-studio:layers.effects.preset.distant-hint'),
    effects: [{ kind: 'highpass', frequencyHz: 200 }, { kind: 'lowpass', frequencyHz: 3000 }, { kind: 'eq', lowDb: -4, midDb: -2, highDb: -3 }],
  },
  {
    id: 'thin',
    label: msg('msu-studio:layers.effects.preset.thin'),
    description: msg('msu-studio:layers.effects.preset.thin-hint'),
    effects: [{ kind: 'highpass', frequencyHz: 600 }, { kind: 'eq', lowDb: -8, midDb: 4, highDb: -2 }],
  },
  {
    id: 'warm',
    label: msg('msu-studio:layers.effects.preset.warm'),
    description: msg('msu-studio:layers.effects.preset.warm-hint'),
    effects: [{ kind: 'eq', lowDb: 3, midDb: 0, highDb: -2 }],
  },
];

const NONE_OPTION: EffectChoice = {
  value: '',
  label: msg('msu-studio:layers.effects.none'),
  description: msg('msu-studio:layers.effects.none-hint'),
};

const PRESET_OPTIONS: EffectChoice[] = [
  NONE_OPTION,
  ...PRESETS.map((preset) => ({ value: preset.id, label: preset.label, description: preset.description })),
];

const EFFECT_KIND_OPTIONS: EffectChoice[] = [
  { value: 'lowpass', label: msg('msu-studio:layers.effects.kind.lowpass'), description: msg('msu-studio:layers.effects.kind.lowpass-hint') },
  { value: 'highpass', label: msg('msu-studio:layers.effects.kind.highpass'), description: msg('msu-studio:layers.effects.kind.highpass-hint') },
  { value: 'eq', label: msg('msu-studio:layers.effects.kind.eq'), description: msg('msu-studio:layers.effects.kind.eq-hint') },
];

const DEFAULT_EFFECT: Record<LayerEffect['kind'], LayerEffect> = {
  lowpass: { kind: 'lowpass', frequencyHz: 1200 },
  highpass: { kind: 'highpass', frequencyHz: 300 },
  eq: { kind: 'eq', lowDb: 0, midDb: 0, highDb: 0 },
};

const MIN_HZ = 20;
const MAX_HZ = 20000;
const MAX_DB = 12;

export { PRESETS, PRESET_OPTIONS, EFFECT_KIND_OPTIONS, DEFAULT_EFFECT, MIN_HZ, MAX_HZ, MAX_DB };
