/* @layer renderer-components @kind component */
import { Icon as IconifyIcon } from '@iconify/react/offline';
import send from '@iconify-icons/lucide/send';
import { Box } from '@ds/primitives/Box';
import { Button } from '@ds/primitives/Button';
import { FfmpegRequiredDialog } from '@domains/app/compounds/FfmpegRequiredDialog';
import { useAllowDebugLogging } from '@app/lib/diagnostics/useAllowDebugLogging';
import { useDraggablePosition } from './behavior/useDraggablePosition';
import { useDebugReportCapture } from './behavior/useDebugReportCapture';
import './DebugReportFloatingButton.css';

interface DebugReportFloatingButtonProps {
  profileId: string | null;
  gameRunning: boolean;
  onReportPackaged: (reportId: string) => void;
}

/** Floating, draggable button over the game view: packages every save state (quick/normal/
 *  auto/live) plus the capture recorder's buffer into a debug report and hands the id to the
 *  bug-report dialog. Self-gates on GameSettings.allowDebugLogging so callers can mount it
 *  unconditionally. */
const DebugReportFloatingButton = ({ profileId, gameRunning, onReportPackaged }: DebugReportFloatingButtonProps) => {
  const allowDebugLogging = useAllowDebugLogging();
  const { offset, dragging, onPointerDown, onPointerMove, onPointerUp } = useDraggablePosition();
  const { status, sendReport, showFfmpegPrompt, resolveFfmpegPrompt } = useDebugReportCapture(profileId);

  if (!allowDebugLogging || !gameRunning || !profileId) return null;

  const handleClick = async () => {
    if (dragging || status === 'packaging') return;
    const reportId = await sendReport();
    if (reportId) onReportPackaged(reportId);
  };

  const handleFfmpegPromptClose = async () => {
    const reportId = await resolveFfmpegPrompt();
    if (reportId) onReportPackaged(reportId);
  };

  return (
    <>
      <Button
        variant="bare"
        className={`debug-report-floating-button${status === 'error' ? ' debug-report-floating-button--error' : ''}`}
        style={{ top: offset.top, right: offset.right }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onClick={handleClick}
        title={status === 'error' ? 'Could not package the report - try again' : 'Send a debug report for the current saves'}
      >
        <IconifyIcon icon={send} width={16} height={16} />
        {status === 'packaging' && <Box as="span" className="debug-report-floating-button__spinner" aria-hidden />}
      </Button>
      <FfmpegRequiredDialog open={showFfmpegPrompt} onClose={() => { void handleFfmpegPromptClose(); }} />
    </>
  );
};

export { DebugReportFloatingButton };
export type { DebugReportFloatingButtonProps };
