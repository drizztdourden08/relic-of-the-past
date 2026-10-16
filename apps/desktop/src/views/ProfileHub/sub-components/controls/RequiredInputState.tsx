/* @layer renderer-components @kind component */
import { Box, Image, Status } from '@drizztdourden08/tessera/primitives';
import type { RequiredInputStateProps } from './controls.type';

const RequiredInputState = (props: RequiredInputStateProps) => {
  const { input } = props;

  return (
    <Box className="controls-options__input">
      <Image src={input.iconSrc} alt="" className="controls-options__icon" />
      <Status tone={input.connected ? 'success' : 'danger'} dot>{input.connected ? 'Connected' : 'Not connected'}</Status>
    </Box>
  );
};

export { RequiredInputState };
