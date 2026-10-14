/* @layer renderer-components @kind types */
import type { EditorToolbarProps } from './EditorToolbar.type';

type ToolbarSettingsProps = Pick<
  EditorToolbarProps,
  'cfg' | 'settingsTokens' | 'structureMode' | 'disabled' | 'onChangeSettings' | 'onChangeStructureMode'
> & {
  open: boolean;
  onPress: (id: string) => void;
};

export type { ToolbarSettingsProps };
