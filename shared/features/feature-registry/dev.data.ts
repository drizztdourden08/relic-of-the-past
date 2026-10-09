/* @layer shared @kind data */
import type { FeatureDef } from '../feature.type';

const DEV_FEATURES: FeatureDef[] = [
  {
    id: 'developerToolsEnabled',
    label: 'Developer tools',
    description: 'Master gate for developer-only instrumentation hooks, such as the transition-settled event the Navigation widget subscribes to in auto mode.',
    userMessage:
      'Turns on developer-only instrumentation. Host-side and purely observational, so it never changes what the game computes. Off by default; leave off unless a feature you use says it needs this.',
    group: 'Dev',
    kind: 'host-event',
    origin: 'relic',
    flag: 'kFeatures0_DeveloperTools',
    bit: 1073741824,
    default: false,
    requires: [],
    affectsVanillaParity: true,
    live: true,
  },
  {
    id: 'devNavigationData',
    label: 'Navigation data reads',
    description: 'Room/grid/sprite data reads that feed the Location & Navigation widget, the flood fill, and the simulator. Needs developer tools on as well (NavQueryGate checks both).',
    userMessage:
      'Feeds the Location & Navigation widget, the flood fill, and the simulator with room/grid/sprite reads. Requires developer tools. Host-side and purely observational, so it never changes what the game computes.',
    group: 'Dev',
    kind: 'host-event',
    origin: 'relic',
    flag: 'kFeatures3_NavigationQueries',
    bit: 2048,
    default: true,
    requires: ['developerToolsEnabled'],
    affectsVanillaParity: true,
    live: true,
  },
];

export { DEV_FEATURES };
