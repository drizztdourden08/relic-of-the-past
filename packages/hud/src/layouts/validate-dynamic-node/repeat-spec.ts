/* @layer shared-hud @kind logic */
import { checkKeys, isRecord } from '../validate-box';
import { validateValue } from '../validate-value';
import { exprAt } from './expr-at';
import { REPEAT_KEYS } from './validate-dynamic-node.constants';
import type { NodeValidator } from '../validate-container';
import type { Issues } from '../validate-box';
import type { HudRepeatSpec } from '../../types/hud-node';

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

export { repeatSpec };
