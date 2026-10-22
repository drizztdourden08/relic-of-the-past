/* @layer renderer-components @kind component */
import { useCallback } from 'react';
import { Button } from '@drizztdourden08/tessera/primitives';
import { inputApi } from '@drizztdourden08/brock-input/renderer';
import { controllerInputStore } from '../../../input/controller-input-store';
import { previewHapticPattern } from '@app/input/haptic-bridge/preview-haptic-pattern';
import type { RumbleTestButtonProps } from './ControllerCard.type';

const RumbleTestButton = ({ deviceKey, test }: RumbleTestButtonProps) => {
  const run = useCallback(() => {
    const result = 'hapticPattern' in test
      ? previewHapticPattern(deviceKey, test.hapticPattern)
      : inputApi().vibratePattern(deviceKey, test.steps, test.gapMs);
    result
      .then(r => { if (!r.ok) controllerInputStore.addDiag(`Vibrate failed (${deviceKey}): ${r.error}`); })
      .catch((e: unknown) => controllerInputStore.addDiag(`Vibrate IPC error: ${String(e)}`));
  }, [deviceKey, test]);

  return (
    <Button variant="tertiary" size="sm" onClick={run}>
      {test.label}
    </Button>
  );
};

export { RumbleTestButton };
