/* @layer shared-game @kind logic */
import { all } from '@rotp/game-data';
import type { ComparisonStrategy } from '../../compare/probe.type';
import { aliasProbes } from './alias-probes';
import { grantProbes } from './grant-probes';

const itemStrategy: ComparisonStrategy<'item'> = {
  kind: 'item',
  subjects: () => all('item'),
  fields: aliasProbes,
  sets: grantProbes,
};

export { itemStrategy };
