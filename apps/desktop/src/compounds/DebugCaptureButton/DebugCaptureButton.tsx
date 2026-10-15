/* @layer renderer-components @kind component */
import { useEffect, useState } from 'react';
import { Icon as IconifyIcon } from '@iconify/react/offline';
import play from '@iconify-icons/lucide/play';
import square from '@iconify-icons/lucide/square';
import { Box, Pressable, Text } from '@drizztdourden08/tessera/primitives';
import { FfmpegRequiredDialog } from '@app/compounds/FfmpegRequiredDialog';
import { useDebugCaptureStore } from '@app/stores/debug-capture-store';
import { useDebugCapture } from './behavior/useDebugCapture';
import type { DebugCaptureButtonProps } from './DebugCaptureButton.type';
import './DebugCaptureButton.css';

const formatElapsed = (ms: number): string => {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = String(Math.floor(totalSeconds / 60)).padStart(2, '0');
  const seconds = String(totalSeconds % 60).padStart(2, '0');
  return `${minutes}:${seconds}`;
};

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
      <Pressable
        className={`debug-round-button debug-capture-button${isCapturing ? ' debug-capture-button--active' : ''}`}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onClick={() => { void handleClick(); }}
        title={isCapturing ? 'Stop debug capture' : 'Start debug capture'}
        aria-label={isCapturing ? 'Stop debug capture' : 'Start debug capture'}
      >
        <IconifyIcon icon={isCapturing ? square : play} width={14} height={14} />
      </Pressable>
      {isCapturing && (
        <Text as="span" className="debug-floating-controls__status-label">{formatElapsed(elapsedMs)}</Text>
      )}
      <FfmpegRequiredDialog open={showFfmpegPrompt} onClose={resolveFfmpegPrompt} />
    </Box>
  );
};

export { DebugCaptureButton };
