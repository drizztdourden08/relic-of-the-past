/* @layer renderer-components @kind component */
import { Button } from '@drizztdourden08/tessera/primitives';
import type { StudioActionButtonProps } from '../StudioFrame.type';

const StudioActionButton = (props: StudioActionButtonProps) => {
  const { action } = props;
  const { label, hint, variant = 'secondary', disabled, onSelect } = action;

  return <Button variant={variant} size="sm" hint={hint} disabled={disabled} onClick={onSelect}>{label}</Button>;
};

export { StudioActionButton };
