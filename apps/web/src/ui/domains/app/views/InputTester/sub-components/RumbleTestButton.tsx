/* @layer renderer-components @kind component */
import { useCallback } from 'react';
import * as controllersStore from '@app/lib/input/controllers-store';
import { Button } from '../../../../../design-system/primitives/Button';
import { controllerInputStore } from '../../../../../../lib/input/controller-input-store';
import { previewHapticPattern } from '../../../../../../lib/input/haptic-bridge';
import type { RumbleTestButtonProps } from './ControllerCard.type';

const RumbleTestButton = ({ deviceKey, test }: RumbleTestButtonProps) => {
  const run = useCallback(() => {
    const result = 'hapticPattern' in test
      ? previewHapticPattern(deviceKey, test.hapticPattern)
      : controllersStore.vibratePattern(deviceKey, test.steps, test.gapMs);
    result
      .then(r => { if (!r.ok) controllerInputStore.addDiag(`⚠ Vibrate failed (${deviceKey}): ${r.error}`); })
      .catch(e => controllerInputStore.addDiag(`⚠ Vibrate IPC error: ${e}`));
  }, [deviceKey, test]);

  return (
    <Button variant="tertiary" size="sm" onClick={run}>
      {test.label}
    </Button>
  );
};

export { RumbleTestButton };
