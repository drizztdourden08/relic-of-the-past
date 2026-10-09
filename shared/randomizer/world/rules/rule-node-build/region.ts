/* @layer shared-game @kind logic */
import type { RegionId } from '@shared/game/data/types/ids';
import type { RuleNode } from '../rule-node.type';

const region = (id: RegionId): RuleNode => ({ op: 'region', region: id });

export { region };
