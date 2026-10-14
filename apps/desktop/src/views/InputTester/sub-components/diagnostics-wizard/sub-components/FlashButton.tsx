/* @layer renderer-components @kind component */
import { Button } from '@drizztdourden08/tessera/primitives';
import type { FlashButtonProps } from './diagnostics-steps.type';

const FlashButton = (props: FlashButtonProps) => {
  const { status, onClick, labels } = props;

  return (
    <Button variant={status === 'error' ? 'danger' : 'tertiary'} onClick={onClick}>
      {labels[status]}
    </Button>
  );
};

export { FlashButton };
