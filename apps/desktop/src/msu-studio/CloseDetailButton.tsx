/* @layer renderer-components @kind component */
import { Icon, IconButton } from '@drizztdourden08/tessera/primitives';
import type { CloseDetailButtonProps } from './CloseDetailButton.type';

const CloseDetailButton = (props: CloseDetailButtonProps) => {
  const { label, onClose } = props;

  return (
    <IconButton variant="ghost" size="sm" label={label} title={label} onClick={onClose}>
      <Icon name="x" />
    </IconButton>
  );
};

export { CloseDetailButton };
