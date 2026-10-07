/* @layer shared-hud @kind logic */
/**
 * `repeat` and `switch` - the two element kinds whose subtree is a `HudNode`
 * instead of a leaf property, so validating either means calling back into
 * `validate-node.ts`'s own `validateNode`. Passed in as `validateNode` rather
 * than imported, the same way `validate-container.ts` already takes it - that
 * file imports this one (for `elementSpec`'s dispatch), so importing back
 * would cycle.
 *
 * A REPEAT'S CHILD IS "INSIDE REPEAT"; ITS COUNT IS NOT. `count` is read in
 * whatever scope the repeat itself sits in - the same ambient `insideRepeat`
 * every other field on this node validates under - while `item` and `child`
 * are read in the repeat's OWN per-pass scope, so both are checked with
 * `insideRepeat` forced true regardless of the ambient value.
 *
 * `when`/`item` ARE BARE EXPRESSION STRINGS, not `{ from: 'data', expr }` -
 * wrapping one in that shape and handing it to `validateValue` reuses its
 * compile-and-check-variables logic exactly instead of re-deriving it here.
 */

import { checkKeys, isRecord } from './validate-box';
import { validateValue } from './validate-value';
import type { NodeValidator } from './validate-container';
import type { Issues } from './validate-box';
import type { HudNode, HudRepeatSpec, HudSwitchCase, HudSwitchSpec } from '../../types/hud/hud-node';

/** A bare expression string, checked by reusing `validateValue`'s own
 *  parse-and-variable-check path - only its issues matter here, not its
 *  (unused) numeric shape. */
const exprAt = (value: unknown, path: string, issues: Issues, insideRepeat: boolean): string | undefined => {
  if (typeof value !== 'string' || !value.trim()) {
    issues.push(`${path}: expected a non-empty expression string`);
    return undefined;
  }
  const checked = validateValue({ from: 'data', expr: value }, path, issues, { insideRepeat });
  return checked === undefined ? undefined : value;
};

const REPEAT_KEYS = ['type', 'count', 'item', 'child'] as const;

const repeatSpec = (
  value: Record<string, unknown>, path: string, issues: Issues, seen: Set<string>, validateNode: NodeValidator,
  insideRepeat: boolean,
): HudRepeatSpec | null => {
  checkKeys(value, REPEAT_KEYS, path, issues);
  const rawCount = value.count;
  const count = validateValue(rawCount, `${path}.count`, issues, { insideRepeat });
  if (count === undefined) {
    if (rawCount === undefined) issues.push(`${path}.count: a repeat needs a count`);
    return null;
  }
  const item = value.item !== undefined ? exprAt(value.item, `${path}.item`, issues, true) : undefined;
  if (value.item !== undefined && item === undefined) return null;
  if (!isRecord(value.child)) { issues.push(`${path}.child: a repeat needs a child`); return null; }
  const child = validateNode(value.child, `${path}.child`, issues, seen, true);
  if (!child) return null;
  return { type: 'repeat', count, ...(item ? { item } : {}), child };
};

const caseAt = (
  value: unknown, path: string, issues: Issues, seen: Set<string>, validateNode: NodeValidator, insideRepeat: boolean,
): HudSwitchCase | null => {
  if (!isRecord(value)) { issues.push(`${path}: expected { when, node }`); return null; }
  checkKeys(value, ['when', 'node'], path, issues);
  const when = exprAt(value.when, `${path}.when`, issues, insideRepeat);
  const node = isRecord(value.node) ? validateNode(value.node, `${path}.node`, issues, seen, insideRepeat) : null;
  if (!isRecord(value.node)) issues.push(`${path}.node: a case needs a node`);
  if (when === undefined || !node) return null;
  return { when, node };
};

const SWITCH_KEYS = ['type', 'cases', 'otherwise'] as const;

const switchSpec = (
  value: Record<string, unknown>, path: string, issues: Issues, seen: Set<string>, validateNode: NodeValidator,
  insideRepeat: boolean,
): HudSwitchSpec | null => {
  checkKeys(value, SWITCH_KEYS, path, issues);
  if (!Array.isArray(value.cases) || value.cases.length === 0) {
    issues.push(`${path}.cases: a switch needs at least one case`);
    return null;
  }
  const cases = value.cases
    .map((entry, i) => caseAt(entry, `${path}.cases[${i}]`, issues, seen, validateNode, insideRepeat))
    .filter((entry): entry is HudSwitchCase => entry !== null);
  if (cases.length !== value.cases.length) return null;
  const otherwise = value.otherwise === undefined ? undefined
    : isRecord(value.otherwise) ? validateNode(value.otherwise, `${path}.otherwise`, issues, seen, insideRepeat) as HudNode | null
      : (issues.push(`${path}.otherwise: expected a node`), null);
  if (value.otherwise !== undefined && !otherwise) return null;
  return { type: 'switch', cases, ...(otherwise ? { otherwise } : {}) };
};

export { repeatSpec, switchSpec };
