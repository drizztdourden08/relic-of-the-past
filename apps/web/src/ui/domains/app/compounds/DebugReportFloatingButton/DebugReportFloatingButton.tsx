/* @layer renderer-components @kind component */
import { Icon as IconifyIcon } from '@iconify/react/offline';
import send from '@iconify-icons/lucide/send';
import { Button } from '@drizztdourden08/tessera/primitives';
import type { DebugReportFloatingButtonProps } from './DebugReportFloatingButton.type';
import './DebugReportFloatingButton.css';

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
