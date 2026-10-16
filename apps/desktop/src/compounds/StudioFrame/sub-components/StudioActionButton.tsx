/* @layer renderer-components @kind component */
import { Box, Button, useHintTarget } from '@drizztdourden08/tessera/primitives';
import type { StudioActionButtonProps } from '../StudioFrame.type';

const StudioActionButton = (props: StudioActionButtonProps) => {
  const { action } = props;
  const { label, hint, variant = 'secondary', disabled, onSelect } = action;
  const handlers = useHintTarget<HTMLElement>({ hint });

  return (
    <Box className="studio-frame__action" {...handlers}>
      <Button variant={variant} size="sm" disabled={disabled} onClick={onSelect}>{label}</Button>
    </Box>
  );
};

export { StudioActionButton };
