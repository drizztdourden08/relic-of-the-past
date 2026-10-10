/* @layer renderer-components @kind types */
import type { Preset } from './presets.type';

type PresetChoiceProps = {
  preset: Preset;
  onPick: (param: number) => void;
};

export type { PresetChoiceProps };
