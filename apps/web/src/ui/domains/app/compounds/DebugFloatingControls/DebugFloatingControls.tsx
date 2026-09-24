/* @layer renderer-components @kind component */
/**
 * The capture-recorder and send-report buttons as one stack, positioned against the actual
 * game-render rectangle (the same rect GameLayer itself is placed at by the dock layout),
 * not the wider .app__content box, so the stack lives inside the real gameplay area and
 * moves with it as a widget docks/undocks. Both idle at reduced opacity, fully opaque while
 * the pointer is over that area OR while a button is actively doing something
 * (capturing/packaging), and self-gate on GameSettings.allowDebugLogging so the caller can
 * mount this unconditionally.
 */
import { useMemo } from 'react';
import { Box } from '@ds/primitives/Box';
import { DebugCaptureButton } from '../DebugCaptureButton';
import { DebugReportFloatingButton } from '../DebugReportFloatingButton';
import { useAllowDebugLogging } from '@app/lib/diagnostics/useAllowDebugLogging';
import { useGameRectStore } from '@app/stores/game-rect-store';
import { useDraggablePosition } from './behavior/useDraggablePosition';
import './DebugFloatingControls.css';

interface DebugFloatingControlsProps {
  profileId: string | null;
  gameRunning: boolean;
  onOpenReport: () => void;
}

const DebugFloatingControls = (props: DebugFloatingControlsProps) => {
  const { profileId, gameRunning, onOpenReport } = props;
  const allowDebugLogging = useAllowDebugLogging();
  const rect = useGameRectStore((s) => s.rect);
  const { offset, dragging, onPointerDown, onPointerMove, onPointerUp } = useDraggablePosition();
  const zoneStyle = useMemo(
    () => (rect ? { left: rect.x, top: rect.y, width: rect.width, height: rect.height } : undefined),
    [rect],
  );
  const stackStyle = useMemo(() => ({ top: offset.top, right: offset.right }), [offset]);
  const dragHandlers = useMemo(() => ({ onPointerDown, onPointerMove, onPointerUp }), [onPointerDown, onPointerMove, onPointerUp]);

  if (!allowDebugLogging || !gameRunning || !profileId) return null;

  return (
    <Box className="debug-floating-controls__hover-zone" style={zoneStyle}>
      <Box className="debug-floating-controls__stack" style={stackStyle}>
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
