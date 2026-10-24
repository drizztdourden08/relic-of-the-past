/* @layer renderer-components @kind hook */
import { createElement, useMemo } from 'react';
import type { LivePage } from '@drizztdourden08/brock-react';
import { useControllerDevices } from '@app/hooks/useControllerDevices';
import { ControllerPage } from '../ControllerPage';
import { noPadsPage } from './no-pads-page';
import { openDiagnostics } from './open-diagnostics';
import { padNavEntries } from './pad-nav-entries';

const usePadPages = (): readonly LivePage[] => {
  const { groups } = useControllerDevices();
  return useMemo(() => {
    const entries = padNavEntries(groups);
    if (entries.length === 0) return [noPadsPage()];
    return entries.map((entry): LivePage => ({
      key: entry.id,
      title: entry.label,
      badge: entry.connected ? 'ok' : 'warn',
      render: () => createElement(ControllerPage, { key: entry.id, deviceKey: entry.id, onRunDiagnostics: openDiagnostics }),
    }));
  }, [groups]);
};

export { usePadPages };
