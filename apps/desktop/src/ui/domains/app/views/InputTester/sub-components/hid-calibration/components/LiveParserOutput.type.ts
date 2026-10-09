/* @layer renderer-components @kind types */
import type { DeviceProfile } from '@shared/input';
import type { ControllerInputState } from '../../../../../../../../lib/input/controller-input-store';

interface LiveParserOutputProps {
  profile: DeviceProfile | null;
  state: ControllerInputState | null;
}

export type { LiveParserOutputProps };
