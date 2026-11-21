/* @layer shared @kind constants */
import { msg } from '@drizztdourden08/brock-core/i18n';
import type { FeatureDef } from '../feature.type';

const HOST_QUERY_FEATURES: FeatureDef[] = [
  {
    id: 'trackerEnabled',
    label: msg('features:feature.trackerEnabled.label'),
    description: 'Inventory and save-flag polling that drives the checks tracker widget.',
    userMessage: msg('features:feature.trackerEnabled.message'),
    group: 'Quality of life',
    kind: 'host-event',
    origin: 'relic',
    flag: 'kFeatures3_TrackerQueries',
    bit: 1024,
    default: true,
    requires: [],
    affectsVanillaParity: false,
    live: true,
  },
];

export { HOST_QUERY_FEATURES };
