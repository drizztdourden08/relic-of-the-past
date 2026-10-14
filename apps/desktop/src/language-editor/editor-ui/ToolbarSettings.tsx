/* @layer renderer-components @kind component */
import settingsIcon from '@iconify-icons/lucide/sliders-horizontal';
import { ToolbarButton } from './ToolbarButton';
import { SettingsPopover } from './popovers';
import { SETTINGS, SETTINGS_LABEL } from './EditorToolbar.constants';
import type { ToolbarSettingsProps } from './ToolbarSettings.type';

const ToolbarSettings = (props: ToolbarSettingsProps) => {
  const { cfg, settingsTokens, structureMode, disabled, open, onPress, onChangeSettings, onChangeStructureMode } = props;
  return (
    <ToolbarButton
      id={SETTINGS}
      icon={settingsIcon}
      label={SETTINGS_LABEL}
      disabled={disabled}
      open={open}
      popover={(
        <SettingsPopover
          label={SETTINGS_LABEL}
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
