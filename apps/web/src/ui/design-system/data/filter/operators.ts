/* @layer renderer-components @kind logic */
/**
 * Which operators a field kind offers. Kinds that cannot be compared directly
 * (object, union, unknown) get existence only. A visibly inert field beats a
 * filter that silently never matches.
 *
 * `icon` is a stable semantic id, not a glyph. A future composite maps these
 * onto real icons; this package stays free of anything visual.
 */
import type { FieldKind } from '../schema/field-descriptor';

type OperatorIcon =
  | 'equals' | 'not-equals'
  | 'greater' | 'greater-eq' | 'less' | 'less-eq' | 'between'
  | 'contains' | 'starts-with' | 'ends-with'
  | 'is-empty' | 'is-not-empty'
  | 'any-of' | 'none-of'
  | 'is-true' | 'is-false'
  | 'length-eq' | 'length-gt' | 'length-lt'
  | 'contains-value';

interface OperatorSpec {
  id: string;
  /** Shown in the dropdown only, since the button carries the icon. */
  label: string;
  icon: OperatorIcon;
  /** Drives which control renders: none takes no operand, many takes a list. */
  arity: 'none' | 'one' | 'many';
}

const IS_EMPTY: OperatorSpec = { id: 'isEmpty', label: 'is empty', icon: 'is-empty', arity: 'none' };
const IS_NOT_EMPTY: OperatorSpec = { id: 'isNotEmpty', label: 'is not empty', icon: 'is-not-empty', arity: 'none' };
const EQ: OperatorSpec = { id: 'eq', label: 'is', icon: 'equals', arity: 'one' };
const NEQ: OperatorSpec = { id: 'neq', label: 'is not', icon: 'not-equals', arity: 'one' };

const STRING_OPERATORS: readonly OperatorSpec[] = [
  { id: 'contains', label: 'contains', icon: 'contains', arity: 'one' },
  { id: 'startsWith', label: 'starts with', icon: 'starts-with', arity: 'one' },
  { id: 'endsWith', label: 'ends with', icon: 'ends-with', arity: 'one' },
  EQ, NEQ, IS_EMPTY, IS_NOT_EMPTY,
];

const NUMBER_OPERATORS: readonly OperatorSpec[] = [
  EQ, NEQ,
  { id: 'gt', label: 'is greater than', icon: 'greater', arity: 'one' },
  { id: 'gte', label: 'is at least', icon: 'greater-eq', arity: 'one' },
  { id: 'lt', label: 'is less than', icon: 'less', arity: 'one' },
  { id: 'lte', label: 'is at most', icon: 'less-eq', arity: 'one' },
  { id: 'between', label: 'is between', icon: 'between', arity: 'many' },
];

const BOOLEAN_OPERATORS: readonly OperatorSpec[] = [
  { id: 'isTrue', label: 'is true', icon: 'is-true', arity: 'none' },
  { id: 'isFalse', label: 'is false', icon: 'is-false', arity: 'none' },
];

const ENUM_OPERATORS: readonly OperatorSpec[] = [
  { id: 'anyOf', label: 'is any of', icon: 'any-of', arity: 'many' },
  { id: 'noneOf', label: 'is none of', icon: 'none-of', arity: 'many' },
];

const ID_REF_OPERATORS: readonly OperatorSpec[] = [EQ, NEQ, IS_EMPTY];

const ARRAY_OPERATORS: readonly OperatorSpec[] = [
  { id: 'containsValue', label: 'contains', icon: 'contains-value', arity: 'one' },
  IS_EMPTY, IS_NOT_EMPTY,
  { id: 'lengthEq', label: 'has exactly', icon: 'length-eq', arity: 'one' },
  { id: 'lengthGt', label: 'has more than', icon: 'length-gt', arity: 'one' },
  { id: 'lengthLt', label: 'has fewer than', icon: 'length-lt', arity: 'one' },
];

const EXISTENCE_OPERATORS: readonly OperatorSpec[] = [IS_EMPTY, IS_NOT_EMPTY];

const OPERATORS_BY_KIND: Record<FieldKind, readonly OperatorSpec[]> = {
  string: STRING_OPERATORS,
  number: NUMBER_OPERATORS,
  boolean: BOOLEAN_OPERATORS,
  enum: ENUM_OPERATORS,
  idRef: ID_REF_OPERATORS,
  array: ARRAY_OPERATORS,
  object: EXISTENCE_OPERATORS,
  union: EXISTENCE_OPERATORS,
  unknown: EXISTENCE_OPERATORS,
};

const operatorsFor = (kind: FieldKind): readonly OperatorSpec[] =>
  OPERATORS_BY_KIND[kind] ?? EXISTENCE_OPERATORS;

const findOperator = (kind: FieldKind, id: string): OperatorSpec | undefined =>
  operatorsFor(kind).find((spec) => spec.id === id);

const isOperatorValid = (kind: FieldKind, id: string): boolean => findOperator(kind, id) !== undefined;

/** The operator a freshly-added clause starts on for this kind. */
const defaultOperatorFor = (kind: FieldKind): string => operatorsFor(kind)[0].id;

export { OPERATORS_BY_KIND, defaultOperatorFor, findOperator, isOperatorValid, operatorsFor };
export type { OperatorIcon, OperatorSpec };
