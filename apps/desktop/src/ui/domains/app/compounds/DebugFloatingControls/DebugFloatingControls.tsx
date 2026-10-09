/* @layer renderer-components @kind component */
import { Box } from '@drizztdourden08/tessera/primitives';
import { DebugCaptureButton } from '../DebugCaptureButton';
import { DebugReportFloatingButton } from '../DebugReportFloatingButton';
import { useAllowDebugLogging } from '@app/lib/diagnostics/useAllowDebugLogging';
import { useDraggablePosition } from './behavior/useDraggablePosition';
import type { DebugFloatingControlsProps } from './DebugFloatingControls.type';
import './DebugFloatingControls.css';

const DebugFloatingControls = (props: DebugFloatingControlsProps) => {
  const { profileId, gameRunning, onOpenReport } = props;
  const allowDebugLogging = useAllowDebugLogging();
  const { offset, dragging, onPointerDown, onPointerMove, onPointerUp } = useDraggablePosition();

  if (!allowDebugLogging || !gameRunning || !profileId) return null;

  const dragHandlers = { onPointerDown, onPointerMove, onPointerUp };
  return (
    <Box
      className="debug-floating-controls__hover-zone"
    >
      <Box
        className="debug-floating-controls__stack"
        style={{ top: offset.top, right: offset.right }}
      >
        <DebugCaptureButton profileId={profileId} {...dragHandlers} />
        <DebugReportFloatingButton
          dragging={dragging}
          onOpenReport={onOpenReport}
          {...dragHandlers}
        />
      </Box>
    </Box>
  );
};

export { DebugFloatingControls };
export type { DebugFloatingControlsProps };
