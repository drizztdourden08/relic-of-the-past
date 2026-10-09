/* @layer shared @kind data */
import type { FeatureDef } from '../feature.type';

const HOST_QUERY_FEATURES: FeatureDef[] = [
  {
    id: 'trackerEnabled',
    label: 'Checks tracker',
    description: 'Inventory and save-flag polling that drives the checks tracker widget.',
    userMessage:
      'Lets the checks tracker read inventory and save flags out of the running game. Turning it off stops that polling and the tracker stops updating. Host-side and purely observational, so it never changes what the game computes.',
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
