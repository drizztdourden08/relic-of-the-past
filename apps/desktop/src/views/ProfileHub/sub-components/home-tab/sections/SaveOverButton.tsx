/* @layer renderer-components @kind component */
import { Icon, IconButton, Tooltip } from '@drizztdourden08/tessera/primitives';
import type { SaveOverButtonProps } from '../home-tab.type';

const SaveOverButton = (props: SaveOverButtonProps) => {
  const { label, disabledReason, tabIndex, onSave } = props;
  return (
    <Tooltip content={disabledReason ?? label}>
      <IconButton size="sm" variant="ghost" label={label} disabled={disabledReason !== undefined} tabIndex={tabIndex} onClick={onSave}>
        <Icon name="save" />
      </IconButton>
    </Tooltip>
  );
};

export { SaveOverButton };
