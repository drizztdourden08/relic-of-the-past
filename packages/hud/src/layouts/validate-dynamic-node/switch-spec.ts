/* @layer shared-hud @kind logic */
import { checkKeys, isRecord } from '../validate-box';
import { exprAt } from './expr-at';
import { SWITCH_KEYS } from './validate-dynamic-node.constants';
import type { NodeContext, NodeValidator } from '../validate-container';
import type { Issues } from '../validate-box';
import type { HudSwitchCase, HudSwitchSpec } from '../../types/hud-node';

const caseAt = (value: unknown, path: string, ctx: NodeContext, validateNode: NodeValidator): HudSwitchCase | null => {
  const { issues, insideRepeat } = ctx;
  if (!isRecord(value)) { issues.push(`${path}: expected { when, node }`); return null; }
  checkKeys(value, ['when', 'node'], path, issues);
  const when = exprAt(value.when, `${path}.when`, issues, insideRepeat);
  const node = isRecord(value.node) ? validateNode(value.node, `${path}.node`, ctx) : null;
  if (!isRecord(value.node)) issues.push(`${path}.node: a case needs a node`);
  if (when === undefined || !node) return null;
  return { when, node };
};

const otherwiseAt = (
  raw: unknown, path: string, issues: Issues, validate: (node: Record<string, unknown>) => ReturnType<NodeValidator>,
): ReturnType<NodeValidator> | undefined => {
  if (raw === undefined) return undefined;
  if (isRecord(raw)) return validate(raw);
  issues.push(`${path}.otherwise: expected a node`);
  return null;
};

const switchSpec = (
  value: Record<string, unknown>, path: string, ctx: NodeContext, validateNode: NodeValidator,
): HudSwitchSpec | null => {
  const { issues } = ctx;
  checkKeys(value, SWITCH_KEYS, path, issues);
  if (!Array.isArray(value.cases) || value.cases.length === 0) {
    issues.push(`${path}.cases: a switch needs at least one case`);
    return null;
  }
  const cases = value.cases
    .map((entry: unknown, i) => caseAt(entry, `${path}.cases[${i}]`, ctx, validateNode))
    .filter((entry): entry is HudSwitchCase => entry !== null);
  if (cases.length !== value.cases.length) return null;
  const otherwise = otherwiseAt(value.otherwise, path, issues, (node) =>
    validateNode(node, `${path}.otherwise`, ctx));
  if (value.otherwise !== undefined && !otherwise) return null;
  return { type: 'switch', cases, ...(otherwise ? { otherwise } : {}) };
};

export { switchSpec };
