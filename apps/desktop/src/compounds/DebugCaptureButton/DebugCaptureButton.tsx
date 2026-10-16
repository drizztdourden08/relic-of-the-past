/* @layer renderer-components @kind component */
import { Icon as IconifyIcon } from '@iconify/react/offline';
import play from '@iconify-icons/lucide/play';
import square from '@iconify-icons/lucide/square';
import { Box, Pressable } from '@drizztdourden08/tessera/primitives';
import { FfmpegRequiredDialog } from '@app/compounds/FfmpegRequiredDialog';
import { useDebugCaptureStore } from '@app/stores/debug-capture-store';
import { useDebugCapture } from './behavior/useDebugCapture';
import { RecordingTimer } from './sub-components/RecordingTimer';
import type { DebugCaptureButtonProps } from './DebugCaptureButton.type';
import './DebugCaptureButton.css';

const DebugCaptureButton = ({ profileId, onPointerDown, onPointerMove, onPointerUp }: DebugCaptureButtonProps) => {
  const startedAt = useDebugCaptureStore((s) => s.startedAt);
  const { isCapturing, handleClick, showFfmpegPrompt, resolveFfmpegPrompt } = useDebugCapture(profileId);

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
      {isCapturing && startedAt !== null && <RecordingTimer startedAt={startedAt} />}
      <FfmpegRequiredDialog open={showFfmpegPrompt} onClose={resolveFfmpegPrompt} />
    </Box>
  );
};

export { DebugCaptureButton };
