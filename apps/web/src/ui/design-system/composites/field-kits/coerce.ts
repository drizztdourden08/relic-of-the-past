/* @layer renderer-components @kind logic */
/**
 * Reading an untyped record value as a primitive. Every kit funnels through
 * these so "absent", "blank" and "not a number" mean the same thing in a filter,
 * a comparator and a cell.
 */

const isNullish = (value: unknown): boolean => value === undefined || value === null;

/** '' for an absent value, so callers never have to print 'undefined'. */
const toText = (value: unknown): string => (isNullish(value) ? '' : String(value));

/** NaN for anything that is not a finite number or a numeric string. */
const toNumber = (value: unknown): number => {
  if (typeof value === 'number') return value;
  if (typeof value === 'string' && value.trim() !== '') return Number(value);
  return NaN;
};

/** A filter operand the user has not filled in yet, which leaves the clause inert. */
const isBlankOperand = (operand: unknown): boolean =>
  isNullish(operand) || (typeof operand === 'string' && operand.trim() === '');

const toList = (value: unknown): readonly unknown[] => (Array.isArray(value) ? value : []);

export { isBlankOperand, isNullish, toList, toNumber, toText };
