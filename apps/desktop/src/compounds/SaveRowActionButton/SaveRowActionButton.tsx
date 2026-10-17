/* @layer renderer-components @kind component */
import type { KeyboardEvent } from 'react';
import { IconButton } from '@drizztdourden08/tessera/primitives';
import type { SaveRowActionButtonProps } from './SaveRowActionButton.type';

const SaveRowActionButton = (props: SaveRowActionButtonProps) => {
  const { label, icons, armed, disabled, disabledReason, tabIndex, onPress, onDisarm } = props;

  const armedLabel = `${label}: armed, click again to confirm`;
  const idleTitle = disabled && disabledReason ? disabledReason : label;

  const handleKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    if (event.key === 'Escape') onDisarm();
  };

  return (
    <IconButton
      variant="ghost"
      size="sm"
      active={armed}
      label={armed ? armedLabel : label}
      title={armed ? armedLabel : idleTitle}
      disabled={disabled}
      tabIndex={tabIndex}
      onClick={onPress}
      onBlur={onDisarm}
      onKeyDown={handleKeyDown}
    >
      {armed ? icons.armed : icons.idle}
    </IconButton>
  );
};

export { SaveRowActionButton };
