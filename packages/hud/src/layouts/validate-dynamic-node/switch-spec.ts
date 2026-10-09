/* @layer shared-hud @kind logic */
import { checkKeys, isRecord } from '../validate-box';
import { exprAt } from './expr-at';
import { SWITCH_KEYS } from './validate-dynamic-node.constants';
import type { NodeValidator } from '../validate-container';
import type { Issues } from '../validate-box';
import type { HudNode, HudSwitchCase, HudSwitchSpec } from '../../types/hud-node';

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

export { switchSpec };
