/* @layer shared-hud @kind logic */
import { compileExpr } from '../data/compile-expr';
import { isHudScopeExtra, isHudVariableName, suggestVariableName } from '../data/variables';
import { checkKeys, isRecord } from './validate-box';
import type { Issues } from './validate-box';
import type { Value } from '../../types/hud/hud-value';
import type { ValueContext } from './validate-value.type';

const validateValue = (
  value: unknown, path: string, issues: Issues, context: ValueContext = {},
): Value | undefined => {
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
