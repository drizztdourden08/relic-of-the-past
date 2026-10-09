/* @layer shared-game @kind logic */
import type { LocationKey } from '../../../location-key.type';
import type { Rule } from '../../../world.type';
import type { RuleEntry } from '../../rule-entry.type';

const locationRow = (rule: Rule) => (target: LocationKey): RuleEntry => ({ kind: 'location', target, mode: 'add', rule });

export { locationRow };
