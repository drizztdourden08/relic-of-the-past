/* @layer shared-game @kind logic */
import { all } from '../../../data';
import type { ComparisonStrategy } from '../../compare/probe.type';
import { aliasProbes } from './alias.probes';
import { grantProbes } from './grants.set';

const itemStrategy: ComparisonStrategy<'item'> = {
  kind: 'item',
  subjects: () => all('item'),
  fields: aliasProbes,
  sets: grantProbes,
};

export { itemStrategy };
