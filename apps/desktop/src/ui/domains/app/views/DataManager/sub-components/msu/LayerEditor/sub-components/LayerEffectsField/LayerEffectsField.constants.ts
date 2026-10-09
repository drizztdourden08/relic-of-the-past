/* @layer renderer-components @kind constants */
import type { LayerEffect } from '@rotp/game-data';
import type { SelectOption } from '@drizztdourden08/tessera/primitives';
import type { EffectPreset } from './LayerEffectsField.type';

const PRESETS: EffectPreset[] = [
  {
    id: 'muffled',
    label: 'Muffled (indoors)',
    description: 'Heard through walls: highs gone, the rest dulled. For an outdoor recording used inside.',
    effects: [{ kind: 'lowpass', frequencyHz: 900 }, { kind: 'eq', lowDb: 2, midDb: -2, highDb: -6 }],
  },
  {
    id: 'distant',
    label: 'Distant',
    description: 'Far away: both ends rolled off and the body pulled back.',
    effects: [{ kind: 'highpass', frequencyHz: 200 }, { kind: 'lowpass', frequencyHz: 3000 }, { kind: 'eq', lowDb: -4, midDb: -2, highDb: -3 }],
  },
  {
    id: 'thin',
    label: 'Thin (through a speaker)',
    description: 'Small and tinny, like a radio or a phone.',
    effects: [{ kind: 'highpass', frequencyHz: 600 }, { kind: 'eq', lowDb: -8, midDb: 4, highDb: -2 }],
  },
  {
    id: 'warm',
    label: 'Warm',
    description: 'A little more low end, a little less fizz.',
    effects: [{ kind: 'eq', lowDb: 3, midDb: 0, highDb: -2 }],
  },
];

const NONE_OPTION: SelectOption = { value: '', label: 'None', description: 'The files play as they are' };

const PRESET_OPTIONS: SelectOption[] = [
  NONE_OPTION,
  ...PRESETS.map((preset) => ({ value: preset.id, label: preset.label, description: preset.description })),
];

const EFFECT_KIND_OPTIONS: SelectOption[] = [
  { value: 'lowpass', label: 'Low-pass', description: 'Rolls off everything above the cutoff' },
  { value: 'highpass', label: 'High-pass', description: 'Rolls off everything below the cutoff' },
  { value: 'eq', label: '3-band EQ', description: 'Low, mid and high, in decibels' },
];

const DEFAULT_EFFECT: Record<LayerEffect['kind'], LayerEffect> = {
  lowpass: { kind: 'lowpass', frequencyHz: 1200 },
  highpass: { kind: 'highpass', frequencyHz: 300 },
  eq: { kind: 'eq', lowDb: 0, midDb: 0, highDb: 0 },
};

const MIN_HZ = 20;
const MAX_HZ = 20000;
const MAX_DB = 12;

const EFFECTS_LABEL = 'Effects';
const EFFECTS_HINT = 'Processing on this layer alone, in order from top to bottom. Pick a preset to start from, then adjust.';

export {
  PRESETS, PRESET_OPTIONS, EFFECT_KIND_OPTIONS, DEFAULT_EFFECT, MIN_HZ, MAX_HZ, MAX_DB,
  EFFECTS_LABEL, EFFECTS_HINT,
};
