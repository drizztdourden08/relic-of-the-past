/* @layer renderer-components @kind constants */
/**
 * The effect presets, and the vocabulary of the controls under them.
 *
 * A preset is a starting point, not a mode: choosing one writes its effects onto the layer, and
 * from there every number is the layer's own to change. That is why there is no "custom" entry to
 * pick — a layer becomes custom the moment a number is touched, and the picker simply reads as
 * none of the presets until it matches one again.
 */
import type { LayerEffect } from '@shared/types/msu-manifest';
import type { SelectOption } from '@ds/primitives/Select';

interface EffectPreset {
  id: string;
  label: string;
  description: string;
  effects: LayerEffect[];
}

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

/** What a newly added effect of each kind starts as — audible, but not drastic. */
const DEFAULT_EFFECT: Record<LayerEffect['kind'], LayerEffect> = {
  lowpass: { kind: 'lowpass', frequencyHz: 1200 },
  highpass: { kind: 'highpass', frequencyHz: 300 },
  eq: { kind: 'eq', lowDb: 0, midDb: 0, highDb: 0 },
};

/** The ear's range, give or take; a cutoff outside it does nothing a listener could hear. */
const MIN_HZ = 20;
const MAX_HZ = 20000;
/** ±12 dB covers every tasteful move and most of the tasteless ones. */
const MAX_DB = 12;

const EFFECTS_LABEL = 'Effects';
const EFFECTS_HINT = 'Processing on this layer alone, in order from top to bottom. Pick a preset to start from, then adjust.';

export {
  PRESETS, PRESET_OPTIONS, EFFECT_KIND_OPTIONS, DEFAULT_EFFECT, MIN_HZ, MAX_HZ, MAX_DB,
  EFFECTS_LABEL, EFFECTS_HINT,
};
export type { EffectPreset };
