/* @layer renderer-components @kind component */
/**
 * The capture-recorder and send-report buttons as one stack, floating over the gameplay
 * area only (not the titlebar, not widget space - a widget sits above this in z-index and
 * naturally occludes the hover zone underneath it). Both idle at reduced opacity and go
 * fully opaque only while the pointer is somewhere over that area; a widget in front of it
 * keeps its own space fully interactive without the stack fading in behind it. Self-gates
 * on GameSettings.allowDebugLogging so the caller can mount it unconditionally.
 */
import { Box } from '@ds/primitives/Box';
import { DebugCaptureButton } from '../DebugCaptureButton';
import { DebugReportFloatingButton } from '../DebugReportFloatingButton';
import { useAllowDebugLogging } from '@app/lib/diagnostics/useAllowDebugLogging';
import { useDraggablePosition } from './behavior/useDraggablePosition';
import './DebugFloatingControls.css';

interface DebugFloatingControlsProps {
  profileId: string | null;
  gameRunning: boolean;
  onReportPackaged: (reportId: string) => void;
}

const DebugFloatingControls = (props: DebugFloatingControlsProps) => {
  const { profileId, gameRunning, onReportPackaged } = props;
  const allowDebugLogging = useAllowDebugLogging();
  const { offset, dragging, onPointerDown, onPointerMove, onPointerUp } = useDraggablePosition();

  if (!allowDebugLogging || !gameRunning || !profileId) return null;

  const dragHandlers = { onPointerDown, onPointerMove, onPointerUp };

  return (
    <Box className="debug-floating-controls__hover-zone">
      <Box className="debug-floating-controls__stack" style={{ top: offset.top, right: offset.right }}>
        <DebugCaptureButton {...dragHandlers} />
        <DebugReportFloatingButton
          profileId={profileId}
          dragging={dragging}
          onReportPackaged={onReportPackaged}
          {...dragHandlers}
        />
      </Box>
    </Box>
  );
};

export { DebugFloatingControls };
export type { DebugFloatingControlsProps };
