/* @layer renderer-app @kind component */
import { useMemo } from 'react';
import type { LiveMeta, LivePage } from '@drizztdourden08/brock-react';
import { useControllerDevices } from '@app/hooks/useControllerDevices';
import { padLivePages } from '@app/views/ControllerPage';

const meta: LiveMeta = {
  icon: 'gamepad-2',
  empty: 'No controllers',
  order: 0,
  keywords: ['controller', 'gamepad', 'hid', 'rumble', 'raw bytes', 'stick', 'trigger', 'calibrate', 'report'],
};

const usePads = (): readonly LivePage[] => {
  const { groups } = useControllerDevices();
  return useMemo(() => padLivePages(groups), [groups]);
};

export default usePads;
export { meta };
