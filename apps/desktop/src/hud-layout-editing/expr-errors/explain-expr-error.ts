/* @layer renderer-components @kind logic */
import { MAX_EXPR_LENGTH } from '@rotp/hud';
import { DISABLED, TRAILING_VERB } from './expr-errors.constants';
import type { ExprProblem } from './expr-errors.type';

const unclosedAt = (source: string): number => {
  const open: number[] = [];
  [...source].forEach((ch, i) => {
    if (ch === '(') open.push(i);
    else if (ch === ')') open.pop();
  });
  return open.at(-1) ?? -1;
};

const openParenCall = (source: string): string => {
  const at = unclosedAt(source);
  if (at < 0) return '(';
  const name = /([A-Za-z_]\w*)$/.exec(source.slice(0, at));
  return `${name?.[1] ?? ''}(`;
};

const withProduct = (source: string): string | undefined => {
  const joined = source.replace(/([\w)!])(\s+)([\w(.])/, '$1 * $3');
  return joined === source ? undefined : joined;
};

const unfinished = (source: string): ExprProblem => {
  const trimmed = source.trimEnd();
  if (unclosedAt(trimmed) >= 0) {
    return { message: `This opens ${openParenCall(trimmed)} and never closes it. Add a ).` };
  }
  const last = trimmed.slice(-1);
  const verb = TRAILING_VERB[last] ?? 'Add the value that comes next.';
  return { message: `The formula stops after ${last}. ${verb}` };
};

const disabledFeature = (what: string): ExprProblem => ({
  message: `${what} is not part of HUD formulas. ${DISABLED}`,
});

const columnOf = (raw: string): number | undefined => {
  const match = /\[\d+:(\d+)]/.exec(raw);
  return match ? Number(match[1]) : undefined;
};

const explainExprError = (source: string, raw: string): ExprProblem => {
  const column = columnOf(raw);

  if (raw.startsWith('random()')) return { message: raw };
  if (raw.startsWith('expression is empty')) {
    return { message: 'Nothing to read yet. Type a name, or pick one from the ƒ menu.' };
  }
  if (raw.includes('over the')) {
    return { message: `A HUD formula is capped at ${MAX_EXPR_LENGTH} characters. This one is longer.` };
  }
  if (raw.includes('unexpected TEOF')) return unfinished(source);
  if (raw.includes('Expected )')) {
    return { message: `This opens ${openParenCall(source)} and never closes it. Add a ).`, column };
  }
  if (raw.includes('Unknown character "&"')) {
    return {
      message: 'This language writes "and" as and, not &&.',
      column,
      fix: { label: 'use and', expr: source.replace(/&&?/g, 'and') },
    };
  }
  if (raw.includes('Unknown character "|"')) {
    return {
      message: '|| joins text here; it is not "or". It reads as two numbers written next to each other.',
      column,
      fix: { label: 'use or', expr: source.replace(/\|\|?/g, 'or') },
    };
  }
  if (raw.includes('Unknown character "="')) return { ...disabledFeature('Assignment'), column };
  if (raw.includes('Unknown character "["')) return { ...disabledFeature('A list'), column };
  if (raw.includes('Expected EOF')) {
    if (/\bin\b/.test(source)) return { ...disabledFeature('The in operator'), column };
    const product = withProduct(source);
    return {
      message: 'Two values with nothing between them.',
      column,
      suggestion: product && `Did you mean ${product}?`,
      fix: product ? { label: 'multiply', expr: product } : undefined,
    };
  }
  return { message: `The formula parser said: ${raw}`, column };
};

export { explainExprError };
