/* @layer renderer-components @kind component */
import { useEffect, useState } from 'react';
import { Icon as IconifyIcon } from '@iconify/react/offline';
import send from '@iconify-icons/lucide/send';
import { Box } from '@ds/primitives/Box';
import { Button } from '@ds/primitives/Button';
import { Text } from '@ds/primitives/Text';
import { ToastContainer } from '@ds/primitives/Toast';
import type { ToastItem } from '@ds/primitives/Toast';
import { FfmpegRequiredDialog } from '@domains/app/compounds/FfmpegRequiredDialog';
import { useDebugReportCapture } from './behavior/useDebugReportCapture';
import './DebugReportFloatingButton.css';

interface DebugReportFloatingButtonProps {
  profileId: string;
  dragging: boolean;
  onPointerDown: (e: React.PointerEvent) => void;
  onPointerMove: (e: React.PointerEvent) => void;
  onPointerUp: (e: React.PointerEvent) => void;
  onReportBuilt: (reportId: string) => void;
}

/** Packages every save state (quick/normal/auto/live) plus the capture recorder's buffer into
 *  a debug report zip and hands the id to the bug-report dialog - local-only, nothing
 *  uploads from here. Position/drag are owned by the parent stack (DebugFloatingControls);
 *  this is presentational plus its own packaging flow. A failure surfaces as a danger toast
 *  (own local queue, same pattern as the Home tab's) - not a tooltip, which needs a hover to
 *  ever be seen. */
const DebugReportFloatingButton = (props: DebugReportFloatingButtonProps) => {
  const { profileId, dragging, onPointerDown, onPointerMove, onPointerUp, onReportBuilt } = props;
  const { status, errorMessage, packageReport, showFfmpegPrompt, resolveFfmpegPrompt } = useDebugReportCapture(profileId);
  const packaging = status === 'packaging';
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  useEffect(() => {
    if (status !== 'error') return;
    const id = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    setToasts((prev) => [...prev, {
      id, variant: 'danger', duration: 5000,
      message: errorMessage ?? 'Could not package the report - try again.',
    }]);
  }, [status, errorMessage]);

  const dismissToast = (id: string) => setToasts((prev) => prev.filter((t) => t.id !== id));

  const handleClick = async () => {
    if (dragging || packaging) return;
    const reportId = await packageReport();
    if (reportId) onReportBuilt(reportId);
  };

  const handleFfmpegPromptClose = async () => {
    const reportId = await resolveFfmpegPrompt();
    if (reportId) onReportBuilt(reportId);
  };

  return (
    <>
      <Button
        variant="bare"
        disabled={packaging}
        className={[
          'debug-round-button', 'debug-report-floating-button',
          status === 'error' && 'debug-report-floating-button--error',
          packaging && 'debug-report-floating-button--busy',
        ].filter(Boolean).join(' ')}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onClick={handleClick}
        title="Package a debug report to attach to a bug report"
      >
        <IconifyIcon icon={send} width={16} height={16} />
        {packaging && <Box as="span" className="debug-report-floating-button__spinner" aria-hidden />}
        {packaging && (
          <Text as="span" className="debug-floating-controls__status-label">Packaging...</Text>
        )}
      </Button>
      <FfmpegRequiredDialog open={showFfmpegPrompt} onClose={() => { void handleFfmpegPromptClose(); }} />
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </>
  );
};

export { DebugReportFloatingButton };
export type { DebugReportFloatingButtonProps };
