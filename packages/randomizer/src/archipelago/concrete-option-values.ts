/* @layer shared-game @kind logic */
import { concreteOptionValue } from './concrete-option-value';

const concreteOptionValues = (values: Record<string, unknown>): Record<string, unknown> =>
  Object.fromEntries(Object.entries(values).map(([key, value]) => [key, concreteOptionValue(key, value)]));

export { concreteOptionValues };
