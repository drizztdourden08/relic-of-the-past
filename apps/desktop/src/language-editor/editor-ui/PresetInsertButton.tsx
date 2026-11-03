/* @layer renderer-components @kind component */
import { ToolbarButton } from './ToolbarButton';
import { PresetPopover } from './popovers';
import type { PresetInsertButtonProps } from './PresetInsertButton.type';

const PresetInsertButton = (props: PresetInsertButtonProps) => {
  const { id, icon, label, code, presets, disabled, openId, onPress, onInsert } = props;

  return (
    <ToolbarButton
      id={id}
      icon={icon}
      label={label}
      disabled={disabled || presets.length === 0}
      open={openId === id}
      popover={<PresetPopover label={label} code={code} presets={presets} onInsert={onInsert} />}
      onPress={onPress}
    />
  );
};

export { PresetInsertButton };
