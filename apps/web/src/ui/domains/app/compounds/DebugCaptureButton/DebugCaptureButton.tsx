/* @layer renderer-components @kind component */
import { useEffect, useState } from 'react';
import { Icon as IconifyIcon } from '@iconify/react/offline';
import play from '@iconify-icons/lucide/play';
import square from '@iconify-icons/lucide/square';
import { Box } from '@ds/primitives/Box';
import { Button } from '@ds/primitives/Button';
import { Text } from '@ds/primitives/Text';
import { FfmpegRequiredDialog } from '@domains/app/compounds/FfmpegRequiredDialog';
import { useDebugCaptureStore } from '@app/stores/debug-capture-store';
import { useDebugCapture } from './behavior/useDebugCapture';
import './DebugCaptureButton.css';

interface DebugCaptureButtonProps {
  profileId: string;
  onPointerDown: (e: React.PointerEvent) => void;
  onPointerMove: (e: React.PointerEvent) => void;
  onPointerUp: (e: React.PointerEvent) => void;
}

const formatElapsed = (ms: number): string => {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = String(Math.floor(totalSeconds / 60)).padStart(2, '0');
  const seconds = String(totalSeconds % 60).padStart(2, '0');
  return `${minutes}:${seconds}`;
};

/** Toggle for the debug-capture recorder, bound through the rebindable function-action system
 *  (Controls settings), default Tab. Only rendered while GameSettings.allowDebugLogging is on;
 *  the caller owns that gate. Position/drag are owned by the parent stack. Starting checks for
 *  ffmpeg (a recording gets encoded into a video the moment it stops, not later) and offers
 *  the install prompt if it's missing; stopping never needs it. */
const DebugCaptureButton = ({ profileId, onPointerDown, onPointerMove, onPointerUp }: DebugCaptureButtonProps) => {
  const startedAt = useDebugCaptureStore((s) => s.startedAt);
  const { isCapturing, handleClick, showFfmpegPrompt, resolveFfmpegPrompt } = useDebugCapture(profileId);
  const [elapsedMs, setElapsedMs] = useState(0);

  useEffect(() => {
    if (!isCapturing || startedAt === null) return;
    setElapsedMs(Date.now() - startedAt);
    const id = setInterval(() => setElapsedMs(Date.now() - startedAt), 500);
    return () => clearInterval(id);
  }, [isCapturing, startedAt]);

  return (
    <Box className={`debug-capture-glow${isCapturing ? ' debug-capture-glow--active' : ''}`}>
      <Box as="span" className="debug-capture-glow__layer debug-capture-glow__layer--1" aria-hidden />
      <Box as="span" className="debug-capture-glow__layer debug-capture-glow__layer--2" aria-hidden />
      <Button
        variant="bare"
        className={`debug-round-button debug-capture-button${isCapturing ? ' debug-capture-button--active' : ''}`}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onClick={() => { void handleClick(); }}
        title={isCapturing ? 'Stop debug capture' : 'Start debug capture'}
        aria-label={isCapturing ? 'Stop debug capture' : 'Start debug capture'}
      >
        <IconifyIcon icon={isCapturing ? square : play} width={14} height={14} />
      </Button>
      {isCapturing && (
        <Text as="span" className="debug-floating-controls__status-label">{formatElapsed(elapsedMs)}</Text>
      )}
      <FfmpegRequiredDialog open={showFfmpegPrompt} onClose={resolveFfmpegPrompt} />
    </Box>
  );
};

export { DebugCaptureButton };
export type { DebugCaptureButtonProps };
