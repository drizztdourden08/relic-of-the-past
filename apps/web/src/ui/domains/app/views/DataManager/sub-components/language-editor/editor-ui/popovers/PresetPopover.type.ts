/* @layer renderer-components @kind types */
import type { Token } from '@shared/game/language';
import type { Preset } from './presets.type';

type PresetPopoverProps = {
  label: string;
  code: string;
  presets: Preset[];
  onInsert: (tokens: Token[]) => void;
};

export type { PresetPopoverProps };
