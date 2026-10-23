/* @layer renderer-components @kind logic */
import { createElement } from 'react';
import { Icon } from '@drizztdourden08/tessera/primitives';
import type { SideNavConfig } from '@drizztdourden08/tessera/composites';
import type { PadNavEntry } from '../ControllerPads.type';
import { PadNavBadge } from '../sub-components/PadNavBadge';

const padNavConfig = (entries: readonly PadNavEntry[]): SideNavConfig => ({
  groups: [
    {
      id: 'pads',
      items: entries.map((entry) => ({
        id: entry.id,
        label: entry.label,
        icon: createElement(Icon, { name: 'gamepad-2' }),
        badge: createElement(PadNavBadge, { connected: entry.connected }),
      })),
    },
  ],
});

export { padNavConfig };
