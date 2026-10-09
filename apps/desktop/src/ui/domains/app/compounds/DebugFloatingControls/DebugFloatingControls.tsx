/* @layer renderer-components @kind component */
import { Box } from '@drizztdourden08/tessera/primitives';
import { DebugCaptureButton } from '../DebugCaptureButton';
import { DebugReportFloatingButton } from '../DebugReportFloatingButton';
import { useAllowDebugLogging } from '@app/lib/diagnostics/useAllowDebugLogging';
import { useExclusiveInsetsStore } from '@app/stores/exclusive-insets-store';
import { useDraggablePosition } from './behavior/useDraggablePosition';
import type { DebugFloatingControlsProps } from './DebugFloatingControls.type';
import './DebugFloatingControls.css';

const DebugFloatingControls = (props: DebugFloatingControlsProps) => {
  const { profileId, gameRunning, onOpenReport } = props;
  const allowDebugLogging = useAllowDebugLogging();
  const insets = useExclusiveInsetsStore((s) => s.insets);
  const { offset, dragging, onPointerDown, onPointerMove, onPointerUp } = useDraggablePosition();

  if (!allowDebugLogging || !gameRunning || !profileId) return null;

  const dragHandlers = { onPointerDown, onPointerMove, onPointerUp };
  const hasInsets = insets.left || insets.right || insets.top || insets.bottom;

  return (
    <Box
      className="debug-floating-controls__hover-zone"
      style={hasInsets ? { left: insets.left, right: insets.right, top: insets.top, bottom: insets.bottom } : undefined}
    >
      <Box
        className="debug-floating-controls__stack"
        style={{ top: offset.top + insets.top, right: offset.right + insets.right }}
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
