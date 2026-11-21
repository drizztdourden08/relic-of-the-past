/* @layer shared @kind constants */
import { msg } from '@drizztdourden08/brock-core/i18n';
import type { FeatureDef } from '../feature.type';

const DEV_FEATURES: FeatureDef[] = [
  {
    id: 'developerToolsEnabled',
    label: msg('features:feature.developerToolsEnabled.label'),
    description: 'Master gate for developer-only instrumentation hooks, such as the transition-settled event the Navigation widget subscribes to in auto mode.',
    userMessage: msg('features:feature.developerToolsEnabled.message'),
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
    label: msg('features:feature.devNavigationData.label'),
    description: 'Room/grid/sprite data reads that feed the Location & Navigation widget, the flood fill, and the simulator. Needs developer tools on as well (NavQueryGate checks both).',
    userMessage: msg('features:feature.devNavigationData.message'),
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
