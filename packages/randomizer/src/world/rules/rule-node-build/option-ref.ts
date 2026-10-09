/* @layer shared-game @kind logic */
import type { RuleArg, RuleCount, RuleOptionKey } from '../rule-node.type';

const optionRef = (key: RuleOptionKey): RuleCount & RuleArg => ({ option: key });

export { optionRef };
