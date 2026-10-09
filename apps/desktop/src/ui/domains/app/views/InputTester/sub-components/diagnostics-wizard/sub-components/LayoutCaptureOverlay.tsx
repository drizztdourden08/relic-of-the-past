/* @layer renderer-components @kind component */
import { Box, Text, Spinner } from '@drizztdourden08/tessera/primitives';
import type { LayoutStage } from '../diagnostics-wizard.type';
import type { LayoutCaptureOverlayProps } from './diagnostics-steps.type';

const stageLabel = (stage: LayoutStage, deviceName: string): string => {
  if (stage === 'starting') return 'Starting SDL';
  if (stage === 'fetching') return `Fetching ${deviceName} layout`;
  if (stage === 'stopping') return 'Shutting down SDL';
  return 'Could not read the controller layout';
};

const LayoutCaptureOverlay = ({ stage, deviceName }: LayoutCaptureOverlayProps) => {
  if (stage === 'idle' || stage === 'done') return null;
  const failed = stage === 'error';

  return (
    <Box className="diagnostics-wizard__overlay" role="status" aria-live="polite">
      <Box className="diagnostics-wizard__overlay-inner">
        {!failed && <Spinner />}
        <Text className="diagnostics-wizard__overlay-label">{stageLabel(stage, deviceName)}</Text>
        {failed && (
          <Text className="diagnostics-wizard__overlay-hint">
            The controller did not report back in time. Go back and pick it again.
          </Text>
        )}
      </Box>
    </Box>
  );
};

export { LayoutCaptureOverlay };
