/* @layer renderer-app @kind component */
import { Icon, IconButton } from '@drizztdourden08/tessera/primitives';
import type { IncludeButtonProps } from './RecordingsPicker.type';

const IncludeButton = (props: IncludeButtonProps) => {
  const { included, name, disabled, tabIndex, onToggle } = props;
  return (
    <IconButton
      size="sm"
      variant="ghost"
      active={included}
      label={`Include the recording from ${name}`}
      aria-pressed={included}
      disabled={disabled}
      tabIndex={tabIndex}
      onClick={onToggle}
    >
      <Icon name="check" />
    </IconButton>
  );
};

export { IncludeButton };
