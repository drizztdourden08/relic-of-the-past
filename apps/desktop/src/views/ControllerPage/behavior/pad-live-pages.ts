/* @layer renderer-components @kind logic */
import { createElement } from 'react';
import type { LivePage } from '@drizztdourden08/brock-react';
import type { ControllerDeviceGroup } from '@rotp/input-mapping';
import { ControllerPage } from '../ControllerPage';
import { noPadsPage } from './no-pads-page';
import { openDiagnostics } from './open-diagnostics';
import { padNavEntries } from './pad-nav-entries';

const padLivePages = (groups: readonly ControllerDeviceGroup[]): LivePage[] => {
  const entries = padNavEntries(groups);
  if (entries.length === 0) return [noPadsPage()];
  return entries.map((entry): LivePage => ({
    key: entry.id,
    title: entry.label,
    badge: entry.connected ? 'ok' : 'warn',
    render: () => createElement(ControllerPage, { key: entry.id, deviceKey: entry.id, onRunDiagnostics: openDiagnostics }),
  }));
};

export { padLivePages };
