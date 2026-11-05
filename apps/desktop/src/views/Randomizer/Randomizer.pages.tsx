/* @layer renderer-components @kind constants */
import type { LivePage } from '@drizztdourden08/brock-react';
import { NetworkPageSlot, OnlinePageSlot } from './sub-components/slots';

const ROTP_RANDOMIZER_PAGES: readonly LivePage[] = [
  { key: 'network', title: 'Network', icon: 'server', render: () => <NetworkPageSlot /> },
  { key: 'online', title: 'Online', icon: 'globe', render: () => <OnlinePageSlot /> },
];

export { ROTP_RANDOMIZER_PAGES };
