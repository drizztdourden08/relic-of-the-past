/* @layer renderer-app @kind component */
import type { LiveMeta } from '@drizztdourden08/brock-react';
import { usePadPages } from '@app/views/ControllerPage';

const meta: LiveMeta = {
  icon: 'gamepad-2',
  empty: 'No controllers',
  order: 0,
  keywords: ['controller', 'gamepad', 'hid', 'rumble', 'raw bytes', 'stick', 'trigger', 'calibrate', 'report'],
};

export default usePadPages;
export { meta };
