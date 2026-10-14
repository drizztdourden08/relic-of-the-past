/* @layer renderer-components @kind component */
import { Box, Text, Status } from '@drizztdourden08/tessera/primitives';
import type { ApplyRowProps } from '../PlayerSpriteStudio.type';

const ApplyRow = (props: ApplyRowProps) => {
  const { applied } = props;

  return (
    <Box className="studio-toolbar__row">
      {applied === true && <Status tone="success">applied to the running game</Status>}
      {applied === false && <Status tone="warning">saved, applies on next boot</Status>}
      {applied === null && <Status tone="neutral">not saved yet</Status>}
      <Text className="studio-toolbar__hint">
        {applied === false
          ? 'The running game did not take it: a live apply needs the active profile to have this sprite selected, with Vanilla Safe off.'
          : 'Saving also pushes the sheet at a running game when the active profile has it selected.'}
      </Text>
    </Box>
  );
};

export { ApplyRow };
