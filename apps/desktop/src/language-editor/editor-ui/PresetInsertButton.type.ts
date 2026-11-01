/* @layer renderer-components @kind types */
import type { Token } from '@rotp/languages';
import type { ToolbarButtonProps } from './ToolbarButton.type';
import type { Preset } from './popovers/presets.type';

type PresetInsertButtonProps = Pick<ToolbarButtonProps, 'id' | 'icon' | 'label' | 'onPress'> & {
  code: string;
  presets: Preset[];
  disabled: boolean;
  openId: string | null;
  onInsert: (tokens: Token[]) => void;
};

export type { PresetInsertButtonProps };
