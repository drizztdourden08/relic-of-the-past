/* @layer renderer-components @kind component */
import { Icon as IconifyIcon } from '@iconify/react/offline';
import circleDot from '@iconify-icons/lucide/circle-dot';
import { IconButton } from '@ds/primitives/IconButton';
import { useDebugCaptureStore } from '@app/stores/debug-capture-store';
import './DebugCaptureButton.css';

/** Titlebar toggle for the debug-capture recorder (also bound to Tab). Only rendered while
 *  GameSettings.allowDebugLogging is on; the caller owns that gate. */
const DebugCaptureButton = () => {
  const isCapturing = useDebugCaptureStore((s) => s.isCapturing);

  return (
    <IconButton
      variant="ghost"
      size="sm"
      active={isCapturing}
      label={isCapturing ? 'Stop debug capture (Tab)' : 'Start debug capture (Tab)'}
      className={`debug-capture-button${isCapturing ? ' debug-capture-button--active' : ''}`}
      onClick={() => useDebugCaptureStore.getState().toggle()}
    >
      <IconifyIcon icon={circleDot} width={14} height={14} />
    </IconButton>
  );
};

export { DebugCaptureButton };
