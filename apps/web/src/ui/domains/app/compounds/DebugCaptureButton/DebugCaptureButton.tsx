/* @layer renderer-components @kind component */
import { useEffect, useState } from 'react';
import { Icon as IconifyIcon } from '@iconify/react/offline';
import play from '@iconify-icons/lucide/play';
import square from '@iconify-icons/lucide/square';
import { Box } from '@ds/primitives/Box';
import { Text } from '@ds/primitives/Text';
import { IconButton } from '@ds/primitives/IconButton';
import { useDebugCaptureStore } from '@app/stores/debug-capture-store';
import './DebugCaptureButton.css';

const formatElapsed = (ms: number): string => {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = String(Math.floor(totalSeconds / 60)).padStart(2, '0');
  const seconds = String(totalSeconds % 60).padStart(2, '0');
  return `${minutes}:${seconds}`;
};

/** Titlebar toggle for the debug-capture recorder, bound through the ordinary rebindable
 *  function-action system (Controls settings), default Tab. Only rendered while
 *  GameSettings.allowDebugLogging is on; the caller owns that gate. */
const DebugCaptureButton = () => {
  const isCapturing = useDebugCaptureStore((s) => s.isCapturing);
  const startedAt = useDebugCaptureStore((s) => s.startedAt);
  const [elapsedMs, setElapsedMs] = useState(0);

  useEffect(() => {
    if (!isCapturing || startedAt === null) return;
    setElapsedMs(Date.now() - startedAt);
    const id = setInterval(() => setElapsedMs(Date.now() - startedAt), 500);
    return () => clearInterval(id);
  }, [isCapturing, startedAt]);

  return (
    <Box className="debug-capture-button-wrap">
      <IconButton
        variant="ghost"
        size="sm"
        label={isCapturing ? 'Stop debug capture' : 'Start debug capture'}
        className={`debug-capture-button${isCapturing ? ' debug-capture-button--active' : ' debug-capture-button--idle'}`}
        onClick={() => useDebugCaptureStore.getState().toggle()}
      >
        <IconifyIcon
          icon={isCapturing ? square : play}
          width={14}
          height={14}
          className={isCapturing ? 'debug-capture-button__icon--pulse' : undefined}
        />
      </IconButton>
      {isCapturing && (
        <Text as="span" className="debug-capture-button__timer">{formatElapsed(elapsedMs)}</Text>
      )}
    </Box>
  );
};

export { DebugCaptureButton };
