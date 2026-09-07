/* @layer renderer-components @kind component */
import { Icon as IconifyIcon } from '@iconify/react/offline';
import send from '@iconify-icons/lucide/send';
import { Box } from '@ds/primitives/Box';
import { Button } from '@ds/primitives/Button';
import { FfmpegRequiredDialog } from '@domains/app/compounds/FfmpegRequiredDialog';
import { useDebugReportCapture } from './behavior/useDebugReportCapture';
import './DebugReportFloatingButton.css';

interface DebugReportFloatingButtonProps {
  profileId: string;
  dragging: boolean;
  onPointerDown: (e: React.PointerEvent) => void;
  onPointerMove: (e: React.PointerEvent) => void;
  onPointerUp: (e: React.PointerEvent) => void;
  onReportPackaged: (reportId: string) => void;
}

/** Packages every save state (quick/normal/auto/live) plus the capture recorder's buffer into
 *  a debug report and hands the id to the bug-report dialog. Position/drag are owned by the
 *  parent stack (DebugFloatingControls); this is presentational plus its own send flow. */
const DebugReportFloatingButton = (props: DebugReportFloatingButtonProps) => {
  const { profileId, dragging, onPointerDown, onPointerMove, onPointerUp, onReportPackaged } = props;
  const { status, sendReport, showFfmpegPrompt, resolveFfmpegPrompt } = useDebugReportCapture(profileId);

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
        className={[
          'debug-round-button', 'debug-report-floating-button',
          status === 'error' && 'debug-report-floating-button--error',
          status === 'packaging' && 'debug-report-floating-button--busy',
        ].filter(Boolean).join(' ')}
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
