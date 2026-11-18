/* @layer renderer-app @kind component */
import { useT } from '@drizztdourden08/brock-react';
import { Icon, IconButton } from '@drizztdourden08/tessera/primitives';
import type { IncludeButtonProps } from './RecordingsPicker.type';

const IncludeButton = (props: IncludeButtonProps) => {
  const { included, name, disabled, tabIndex, onToggle } = props;
  const t = useT();
  return (
    <IconButton
      size="sm"
      variant="ghost"
      active={included}
      label={t('views-bug-report-recordings:include', { name })}
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
