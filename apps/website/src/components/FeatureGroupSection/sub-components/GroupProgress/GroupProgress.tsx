/* @layer website-site @kind component */
import { Box } from '@drizztdourden08/tessera/primitives';
import './GroupProgress.css';

const GroupProgress = () => (
  <Box className="group-progress" aria-hidden="true">
    <Box className="group-progress__fill" />
  </Box>
);

export { GroupProgress };
