/* @layer shared-game @kind logic */
import { all } from '@rotp/game-data';
import type { ComparisonStrategy } from '../../compare/probe.type';
import { eraseSetProbe } from '../../compare/erase-set-probe';
import { combatProbe } from './combat-probe';
import { actorSpawnsProbe } from './actor-spawns-probe';

const actorStrategy: ComparisonStrategy<'actor'> = {
  kind: 'actor',
  subjects: () => all('actor'),
  fields: [combatProbe],
  sets: [eraseSetProbe(actorSpawnsProbe)],
};

export { actorStrategy };
