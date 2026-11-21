/* @layer renderer-components @kind component */
import settingsIcon from '@iconify-icons/lucide/sliders-horizontal';
import { useT } from '@drizztdourden08/brock-react';
import { ToolbarButton } from './ToolbarButton';
import { SettingsPopover } from './popovers';
import { SETTINGS } from './EditorToolbar.constants';
import type { ToolbarSettingsProps } from './ToolbarSettings.type';

const ToolbarSettings = (props: ToolbarSettingsProps) => {
  const { cfg, settingsTokens, structureMode, disabled, open, onPress, onChangeSettings, onChangeStructureMode } = props;
  const label = useT()('language-editor:toolbar.settings');
  return (
    <ToolbarButton
      id={SETTINGS}
      icon={settingsIcon}
      label={label}
      disabled={disabled}
      open={open}
      popover={(
        <SettingsPopover
          label={label}
          cfg={cfg}
          tokens={settingsTokens}
          structureMode={structureMode}
          onChangeSettings={onChangeSettings}
          onChangeStructureMode={onChangeStructureMode}
        />
      )}
      onPress={onPress}
    />
  );
};

export { ToolbarSettings };
