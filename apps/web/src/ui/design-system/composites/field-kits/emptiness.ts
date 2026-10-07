/* @layer renderer-components @kind logic */
/**
 * Existence, the one comparison every kind supports. A blank string, an empty
 * list and an object with no keys all read as "nothing recorded here", which is
 * what someone filtering for `is empty` is asking.
 */
import { isNullish } from './coerce';

const isEmptyValue = (value: unknown): boolean => {
  if (isNullish(value)) return true;
  if (typeof value === 'string') return value.trim() === '';
  if (Array.isArray(value)) return value.length === 0;
  if (typeof value === 'object') return Object.keys(value as object).length === 0;
  return false;
};

/**
 * The whole tester for kinds that offer existence and nothing else. An operator
 * this does not know returns true, matching the core's rule that a clause it
 * cannot honour is inert instead of silently hiding every row.
 */
const testExistence = (value: unknown, op: string): boolean => {
  if (op === 'isEmpty') return isEmptyValue(value);
  if (op === 'isNotEmpty') return !isEmptyValue(value);
  return true;
};

export { isEmptyValue, testExistence };
