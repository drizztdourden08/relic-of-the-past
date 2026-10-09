/* @layer renderer-components @kind component */
import { useCallback } from 'react';
import { Button } from '@drizztdourden08/tessera/primitives';
import { controllerInputStore } from '../../../input/controller-input-store';
import { previewHapticPattern } from '@app/input/haptic-bridge/preview-haptic-pattern';
import type { RumbleTestButtonProps } from './ControllerCard.type';

const RumbleTestButton = ({ deviceKey, test }: RumbleTestButtonProps) => {
  const run = useCallback(() => {
    previewHapticPattern(deviceKey, test.hapticPattern)
      .then(r => { if (!r.ok) controllerInputStore.addDiag(`Vibrate failed (${deviceKey}): ${r.error}`); })
      .catch(e => controllerInputStore.addDiag(`Vibrate error: ${e}`));
  }, [deviceKey, test]);

  return (
    <Button variant="tertiary" size="sm" onClick={run}>
      {test.label}
    </Button>
  );
};

export { RumbleTestButton };
