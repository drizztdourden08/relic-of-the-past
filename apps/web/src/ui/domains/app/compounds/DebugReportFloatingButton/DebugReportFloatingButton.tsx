/* @layer renderer-components @kind component */
import { Icon as IconifyIcon } from '@iconify/react/offline';
import send from '@iconify-icons/lucide/send';
import { Button } from '@ds/primitives/Button';
import './DebugReportFloatingButton.css';

interface DebugReportFloatingButtonProps {
  dragging: boolean;
  onPointerDown: (e: React.PointerEvent) => void;
  onPointerMove: (e: React.PointerEvent) => void;
  onPointerUp: (e: React.PointerEvent) => void;
  onOpenReport: () => void;
}

/** Opens the bug-report dialog, where the session picker and save states are packaged into a
 *  debug report at submit time (see useBugReportForm) - this button no longer packages
 *  anything itself. Position/drag are owned by the parent stack (DebugFloatingControls). */
const DebugReportFloatingButton = (props: DebugReportFloatingButtonProps) => {
  const { dragging, onPointerDown, onPointerMove, onPointerUp, onOpenReport } = props;

  return (
    <Button
      variant="bare"
      className="debug-round-button debug-report-floating-button"
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onClick={() => { if (!dragging) onOpenReport(); }}
      title="Report a bug, with a chance to attach a debug report"
    >
      <IconifyIcon icon={send} width={16} height={16} />
    </Button>
  );
};

export { DebugReportFloatingButton };
export type { DebugReportFloatingButtonProps };
