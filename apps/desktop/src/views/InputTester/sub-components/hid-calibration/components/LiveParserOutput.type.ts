/* @layer renderer-components @kind types */
import type { DeviceProfile } from '@rotp/input-mapping';
import type { ControllerInputState } from '../../../../../input/controller-input-store';

interface LiveParserOutputProps {
  profile: DeviceProfile | null;
  state: ControllerInputState | null;
}

export type { LiveParserOutputProps };
