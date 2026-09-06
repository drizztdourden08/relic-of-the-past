/* @layer renderer-components @kind logic */
/**
 * Registry of per-kind predicate strategies. This is the seam between the
 * headless core and the UI field kits that own the actual comparisons.
 *
 * This package deliberately ships NO testers. The kit package registers one
 * per kind at import time; until it does, `compile()` treats a clause whose
 * kind has no tester as inert (see clause.ts) instead of filtering everything
 * away, so a partially-loaded registry can never produce a mysteriously empty
 * table.
 */
import type { FieldKind } from '../schema/field-descriptor';

/**
 * Per-clause modifiers that change HOW a comparison is made, not WHAT it
 * compares. They travel beside the operand instead of inside it, so the value a
 * control edits keeps the plain shape its operator's arity asks for.
 *
 * A tester ignores any modifier it has no meaning for. The argument is optional,
 * so a three-parameter tester still satisfies this type.
 */
interface FilterTestOptions {
  /** Text comparisons fold case unless a clause opts out of that. */
  caseSensitive?: boolean;
}

interface FieldTester {
  test: (value: unknown, op: string, operand: unknown, options?: FilterTestOptions) => boolean;
}

const testers = new Map<FieldKind, FieldTester>();

const registerFieldTester = (kind: FieldKind, tester: FieldTester): void => {
  testers.set(kind, tester);
};

const getFieldTester = (kind: FieldKind): FieldTester | undefined => testers.get(kind);

const hasFieldTester = (kind: FieldKind): boolean => testers.has(kind);

/** Test hygiene only. Production code registers once and never clears. */
const clearFieldTesters = (): void => {
  testers.clear();
};

export { clearFieldTesters, getFieldTester, hasFieldTester, registerFieldTester };
export type { FieldTester, FilterTestOptions };
