/* @layer shared-game @kind constants */
import { LIGHT_OVERWORLD_RULES } from './light-overworld-rules.constants';
import { DARK_OVERWORLD_RULES } from './dark-overworld-rules.constants';
import type { RuleEntry } from '../../rule-entry.type';

const DEFAULT_OVERWORLD_RULES: readonly RuleEntry[] = [...LIGHT_OVERWORLD_RULES, ...DARK_OVERWORLD_RULES];

export { DEFAULT_OVERWORLD_RULES };
