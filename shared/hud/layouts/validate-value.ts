/* @layer shared-hud @kind logic */
/**
 * A `Value`, checked: a bare number passes through; a data-bound expression
 * must PARSE and every name it uses must be one `variables.ts` knows about -
 * or, inside a `repeat`'s subtree, one of the three scope extras. Refused with
 * the field's own path and, where expr-eval reports one, the character column
 * it choked at, plus a "did you mean" for a near-miss variable name - the same
 * standard `validate-box.ts` already holds every other field to.
 *
 * NOT YET CALLED FROM A REAL DOCUMENT. No field on `HudBox`/`HudNode` is typed
 * as `Value` today - that is `hud-node.ts`, owned by phase 2 of
 * `plans/hud-data-binding.html` and out of scope for this one. This is the
 * hook phase 2's `validate-box.ts`/`validate-node.ts` call the moment a field
 * (`scale`, `size.w` and the like) is actually typed as one; it is exported from this
 * file, alongside `validateLayout`, so that call is a straight import rather
 * than a re-derivation of these rules.
 */

import { compileExpr } from '../data/compile-expr';
import { isHudScopeExtra, isHudVariableName, suggestVariableName } from '../data/variables';
import { checkKeys, isRecord } from './validate-box';
import type { Issues } from './validate-box';
import type { Value } from '../../types/hud/hud-value';

interface ValueContext {
  /** True when the field being checked sits inside a `repeat`'s subtree, so
   *  `index`, `count` and `item` count as known names here and only here. */
  insideRepeat?: boolean;
  /** Extra names known ONLY at this one call site - `transition.when`'s own
   *  `delta` (`validate-motion.ts`), which means nothing anywhere else in
   *  the document and so is not a real table entry or a scope extra. */
  extraNames?: readonly string[];
}

const validateValue = (
  value: unknown, path: string, issues: Issues, context: ValueContext = {},
): Value | undefined => {
  // Every field this validates is OPTIONAL on its box (`scale`, `opacity`,
  // `size.w.px`'s min/max and so on) - undefined means "not authored", not "wrong",
  // so it is not an issue. Phase 2's callers (`validate-box.ts` and friends)
  // rely on this: they call `validateValue(value.scale, path, issues)`
  // unconditionally, the same way every other optional-field checker in this
  // document already does.
  if (value === undefined) return undefined;
  if (typeof value === 'number') {
    if (!Number.isFinite(value)) {
      issues.push(`${path}: expected a finite number or { from: 'data', expr }, got ${JSON.stringify(value)}`);
      return undefined;
    }
    return value;
  }

  if (!isRecord(value)) {
    issues.push(`${path}: expected a number or { from: 'data', expr }, got ${JSON.stringify(value)}`);
    return undefined;
  }
  checkKeys(value, ['from', 'expr'], path, issues);
  if (value.from !== 'data') {
    issues.push(`${path}.from: expected 'data', got ${JSON.stringify(value.from)}`);
    return undefined;
  }
  if (typeof value.expr !== 'string') {
    issues.push(`${path}.expr: expected a string, got ${JSON.stringify(value.expr)}`);
    return undefined;
  }

  const compiled = compileExpr(value.expr);
  if (!compiled.ok) {
    const at = compiled.column !== undefined ? ` at column ${compiled.column}` : '';
    issues.push(`${path}.expr: ${compiled.message}${at} - in "${value.expr}"`);
    return undefined;
  }

  const insideRepeat = context.insideRepeat ?? false;
  const unknownNames = compiled.expr.variables
    .filter((name) => (
      !isHudVariableName(name) && !(insideRepeat && isHudScopeExtra(name)) && !(context.extraNames?.includes(name))
    ));
  unknownNames.forEach((name) => {
    const suggestion = suggestVariableName(name, insideRepeat);
    const hint = suggestion ? ` - did you mean ${suggestion}?` : '';
    issues.push(`${path}.expr: unknown variable "${name}"${hint}`);
  });
  if (unknownNames.length) return undefined;

  return { from: 'data', expr: value.expr };
};

export { validateValue };
export type { ValueContext };
