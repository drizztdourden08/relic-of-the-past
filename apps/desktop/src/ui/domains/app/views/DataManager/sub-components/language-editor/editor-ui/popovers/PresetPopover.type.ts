/* @layer renderer-components @kind types */
import type { Token } from '@rotp/languages';
import type { Preset } from './presets.type';

type PresetPopoverProps = {
  label: string;
  code: string;
  presets: Preset[];
  onInsert: (tokens: Token[]) => void;
};

export type { PresetPopoverProps };
