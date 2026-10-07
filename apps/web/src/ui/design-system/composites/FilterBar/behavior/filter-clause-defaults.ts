/* @layer renderer-components @kind logic */
/** The value a new clause starts with, and what happens to it when the operator's arity changes. */
import { createClause } from '../../../data/filter/clause';
import { defaultOperatorFor, findOperator } from '../../../data/filter/operators';
import type { FilterClause } from '../../../data/filter/clause';
import type { OperatorSpec } from '../../../data/filter/operators';
import type { FieldDescriptor, FieldKind } from '../../../data/schema/field-descriptor';

type Arity = OperatorSpec['arity'];

/** 'none' takes no operand at all; 'many' starts as an empty list; 'one' starts blank. */
const defaultValueForArity = (arity: Arity): unknown => (arity === 'many' ? [] : null);

/** A freshly added clause: the kind's default operator, and a value shaped for its arity. */
const createClauseForField = (field: FieldDescriptor): FilterClause => {
  const op = defaultOperatorFor(field.kind);
  const arity = findOperator(field.kind, op)?.arity ?? 'one';
  return createClause(field.path, op, defaultValueForArity(arity));
};

interface OperatorChangeInput {
  kind: FieldKind;
  previousOp: string;
  nextOp: string;
  currentValue: unknown;
}

/** Switching operators only resets the value when the arity changes; `gt` to `lt` keeps what was entered. */
const valueForOperatorChange = (input: OperatorChangeInput): unknown => {
  const { kind, previousOp, nextOp, currentValue } = input;
  const previousArity = findOperator(kind, previousOp)?.arity ?? 'one';
  const nextArity = findOperator(kind, nextOp)?.arity ?? 'one';
  if (previousArity === nextArity) return currentValue;
  return defaultValueForArity(nextArity);
};

export { createClauseForField, defaultValueForArity, valueForOperatorChange };
export type { OperatorChangeInput };
