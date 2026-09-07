/* @layer renderer-components @kind component */
import { useAllowDebugLogging } from '@app/lib/diagnostics/useAllowDebugLogging';
import { DebugCaptureButton } from '../DebugCaptureButton';

/** Self-gates on GameSettings.allowDebugLogging, so the titlebar only has to mount this
 *  unconditionally. The toggle shortcut itself is wired in the input manager
 *  (input-manager-debug-capture.ts), not here - this component is display-only. */
const DebugCaptureControls = () => {
  const allowDebugLogging = useAllowDebugLogging();
  if (!allowDebugLogging) return null;
  return <DebugCaptureButton />;
};

export { DebugCaptureControls };
