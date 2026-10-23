/* @layer renderer-components @kind hook */
import { useMemo, useState } from 'react';
import { useControllerDevices } from '@app/hooks/useControllerDevices';
import type { SideNavConfig } from '@drizztdourden08/tessera/composites';
import { padNavConfig } from './pad-nav-config';
import { padNavEntries } from './pad-nav-entries';

const usePadNav = (initialDeviceKey: string | null | undefined) => {
  const { groups } = useControllerDevices();
  const [picked, setPicked] = useState<string | null>(initialDeviceKey ?? null);
  const entries = useMemo(() => padNavEntries(groups), [groups]);
  const config: SideNavConfig = useMemo(() => padNavConfig(entries), [entries]);
  const activeKey = picked ?? entries.at(0)?.id ?? null;
  const gone = activeKey !== null && !entries.some((entry) => entry.id === activeKey);

  return { config, activeKey, gone, empty: entries.length === 0, pick: setPicked };
};

export { usePadNav };
