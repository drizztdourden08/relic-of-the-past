/* @layer shared-game @kind logic */
import type { RegionId } from '@rotp/game-data';
import type { RuleNode } from '../rule-node.type';

const region = (id: RegionId): RuleNode => ({ op: 'region', region: id });

export { region };
