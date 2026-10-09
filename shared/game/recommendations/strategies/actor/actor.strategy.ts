/* @layer shared-game @kind logic */
import { all } from '@rotp/game-data';
import type { ComparisonStrategy } from '../../compare/probe.type';
import { combatProbe } from './combat.probes';
import { actorSpawnsProbe } from './spawns.set';

const actorStrategy: ComparisonStrategy<'actor'> = {
  kind: 'actor',
  subjects: () => all('actor'),
  fields: [combatProbe],
  sets: [actorSpawnsProbe],
};

export { actorStrategy };
