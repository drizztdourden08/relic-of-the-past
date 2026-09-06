/* @layer renderer-components @kind logic */
/**
 * The handful of values worth offering for the two codes an author still places
 * by hand: how long the text holds still, and how fast it draws.
 *
 * Both take a raw 0..15 parameter, which is a byte editor, not a choice.
 * A pause is roughly half a second per step, so four points across that range
 * cover everything a line is written for: a beat, a breath, a long hold, the
 * full stop. The speed presets are the four the engine's own draw loop makes
 * meaningfully different.
 *
 * Every preset is filtered through what the LANGUAGE can bake before it is
 * shown, so nothing offered here can fail to compile. An encoder that refuses
 * the code outright leaves an empty list, and the button that would open it is
 * disabled instead of opening on nothing.
 */
import { encodableParams } from '@shared/game/language';
import type { LanguageConfig } from '@shared/asset-extraction/text/data/language-data';

/** One offer: the engine parameter, and the plain-language word for it. */
type Preset = {
  param: number;
  label: string;
};

const PAUSE_CODE = 'Wait';
const SPEED_CODE = 'Speed';

/** Roughly half a second per step of the parameter. */
const PAUSE_PRESETS: readonly Preset[] = [
  { param: 0, label: '½ s' },
  { param: 3, label: '2 s' },
  { param: 7, label: '4 s' },
  { param: 15, label: '8 s' },
];

/** Frames of delay per character; zero draws the whole message at once. */
const SPEED_PRESETS: readonly Preset[] = [
  { param: 0, label: 'instant' },
  { param: 1, label: 'fast' },
  { param: 2, label: 'normal' },
  { param: 4, label: 'slow' },
];

const encodableOf = (
  name: string,
  cfg: LanguageConfig,
  presets: readonly Preset[],
): Preset[] => {
  const values = encodableParams(name, cfg);
  if (values === null) return [];
  const allowed = new Set(values);
  return presets.filter((preset) => allowed.has(preset.param));
};

const pausePresetsFor = (cfg: LanguageConfig): Preset[] =>
  encodableOf(PAUSE_CODE, cfg, PAUSE_PRESETS);

const speedPresetsFor = (cfg: LanguageConfig): Preset[] =>
  encodableOf(SPEED_CODE, cfg, SPEED_PRESETS);

export { PAUSE_CODE, pausePresetsFor, SPEED_CODE, speedPresetsFor };
export type { Preset };
