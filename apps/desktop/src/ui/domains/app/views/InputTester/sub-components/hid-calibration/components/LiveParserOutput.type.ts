/* @layer renderer-components @kind types */
import type { DeviceProfile } from '@rotp/input-mapping';
import type { ControllerInputState } from '../../../../../../../../lib/input/controller-input-store';

interface LiveParserOutputProps {
  profile: DeviceProfile | null;
  state: ControllerInputState | null;
}

export type { LiveParserOutputProps };
