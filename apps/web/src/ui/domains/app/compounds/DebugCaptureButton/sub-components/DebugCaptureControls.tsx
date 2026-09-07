/* @layer renderer-components @kind component */
import { useAllowDebugLogging } from '@app/lib/diagnostics/useAllowDebugLogging';
import { useDebugCaptureShortcut } from '../../../views/TitleBar/behavior/useDebugCaptureShortcut';
import { DebugCaptureButton } from '../DebugCaptureButton';

/** Wires the Tab shortcut and self-gates on GameSettings.allowDebugLogging, so the titlebar
 *  only has to mount this unconditionally. */
const DebugCaptureControls = () => {
  const allowDebugLogging = useAllowDebugLogging();
  useDebugCaptureShortcut(allowDebugLogging);
  if (!allowDebugLogging) return null;
  return <DebugCaptureButton />;
};

export { DebugCaptureControls };
