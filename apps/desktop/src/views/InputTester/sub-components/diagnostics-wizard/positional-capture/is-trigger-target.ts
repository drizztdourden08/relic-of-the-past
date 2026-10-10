/* @layer renderer-components @kind logic */
import { TRIGGER_ID_PATTERN } from './positional-capture.constants';
import type { PositionalTarget } from './positional-capture.type';

const isTriggerTarget = (target: PositionalTarget): boolean => TRIGGER_ID_PATTERN.test(target.id);

export { isTriggerTarget };
