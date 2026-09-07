/* @layer renderer-components @kind component */
/**
 * The capture-recorder and send-report buttons as one stack, positioned against the actual
 * game-render rectangle (the same exclusiveInsets GameLayer itself shrinks against for a
 * docked widget), not the wider .app__content box - so the stack lives inside the real
 * gameplay area and moves with it as a widget docks/undocks. Both idle at reduced opacity,
 * fully opaque while the pointer is over that area OR while a button is actively doing
 * something (capturing/packaging), and self-gate on GameSettings.allowDebugLogging so the
 * caller can mount this unconditionally.
 */
import { Box } from '@ds/primitives/Box';
import { DebugCaptureButton } from '../DebugCaptureButton';
import { DebugReportFloatingButton } from '../DebugReportFloatingButton';
import { useAllowDebugLogging } from '@app/lib/diagnostics/useAllowDebugLogging';
import { useExclusiveInsetsStore } from '@app/stores/exclusive-insets-store';
import { useDraggablePosition } from './behavior/useDraggablePosition';
import './DebugFloatingControls.css';

interface DebugFloatingControlsProps {
  profileId: string | null;
  gameRunning: boolean;
  onReportBuilt: (reportId: string) => void;
}

const DebugFloatingControls = (props: DebugFloatingControlsProps) => {
  const { profileId, gameRunning, onReportBuilt } = props;
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
          profileId={profileId}
          dragging={dragging}
          onReportBuilt={onReportBuilt}
          {...dragHandlers}
        />
      </Box>
    </Box>
  );
};

export { DebugFloatingControls };
export type { DebugFloatingControlsProps };
