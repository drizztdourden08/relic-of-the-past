/* @layer shared-game @kind logic */
import { all } from '@rotp/game-data';
import type { ComparisonStrategy } from '../../compare/probe.type';
import { combatProbe } from './combat-probe';
import { actorSpawnsProbe } from './actor-spawns-probe';

const actorStrategy: ComparisonStrategy<'actor'> = {
  kind: 'actor',
  subjects: () => all('actor'),
  fields: [combatProbe],
  sets: [actorSpawnsProbe],
};

export { actorStrategy };
