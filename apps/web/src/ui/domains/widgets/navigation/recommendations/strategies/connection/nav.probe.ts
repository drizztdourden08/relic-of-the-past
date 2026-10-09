/* @layer renderer-widgets @kind data */
import type { FieldProbe } from '@shared/game/recommendations/compare';
import { navProbeApplies } from './nav/nav-probe-applies';
import { readNavProbe } from './nav/read-nav-probe';

const NAV_PROBE: FieldProbe<'connection'> = {
  path: 'nav',
  label: 'Tile data',
  source: 'flood:crossing',
  confidence: 'likely',
  applies: navProbeApplies,
  read: readNavProbe,
};

export { NAV_PROBE };
export { endpointsResolvable } from './nav/endpoints-resolvable';
