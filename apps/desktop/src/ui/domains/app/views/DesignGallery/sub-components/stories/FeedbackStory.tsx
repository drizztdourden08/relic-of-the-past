/* @layer renderer-app @kind component */
import { Box, Button, ProgressBar, Spinner, Tooltip, EmptyState, Divider } from '../../../../../../design-system/primitives';
import { Specimen } from '../Specimen';

/** Components › feedback & status. */
const FeedbackStory = () => (
  <Box className="dg-stack">
    <Specimen label="ProgressBar" hint="gold / green (with secondary) / danger">
      <Box className="dg-stack-sm">
        <ProgressBar value={70} variant="gold" />
        <ProgressBar value={45} secondaryValue={70} variant="green" />
        <ProgressBar value={20} variant="danger" />
      </Box>
    </Specimen>

    <Specimen label="Spinner" hint="sm / md / lg">
      <Box className="dg-row">
        <Spinner size="sm" />
        <Spinner size="md" />
        <Spinner size="lg" />
      </Box>
    </Specimen>

    <Specimen label="Tooltip" hint="hover the button">
      <Tooltip content="Saved to profile">
        <Button variant="bare" className="dg-btn">Hover me</Button>
      </Tooltip>
    </Specimen>

    <Specimen label="EmptyState">
      <EmptyState icon="🗺️" message="No checks match the current filters" />
    </Specimen>

    <Specimen label="Divider">
      <Divider />
    </Specimen>
  </Box>
);

export { FeedbackStory };
