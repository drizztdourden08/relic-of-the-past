/* @layer renderer-components @kind component */
/**
 * Covers the step while its controller's layout is being read. The read needs
 * SDL brought back up and taken down again, which takes long enough to notice,
 * so each stage is named, not left as an unexplained wait.
 */
import { Box } from '../../../../../../../design-system/primitives/Box';
import { Text } from '../../../../../../../design-system/primitives/Text';
import { Spinner } from '../../../../../../../design-system/primitives/Spinner';
import type { LayoutStage } from '../behavior/useLayoutCapture';

interface LayoutCaptureOverlayProps {
  stage: LayoutStage;
  /** Named in the fetch line so it is obvious which pad is being read. */
  deviceName: string;
}

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
