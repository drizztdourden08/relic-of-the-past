/* @layer renderer-components @kind logic */
import { MAX_EXPR_LENGTH } from '@rotp/hud';
import { msg } from '@drizztdourden08/brock-core/i18n';
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
    return { message: msg('hud-editing:expr.unclosed', { call: openParenCall(trimmed) }) };
  }
  const last = trimmed.slice(-1);
  const stops = TRAILING_VERB[last];
  return { message: stops ? stops(last) : msg('hud-editing:expr.stops.default', { last }) };
};

const disabledFeature = (what: keyof typeof DISABLED): ExprProblem => ({
  message: DISABLED[what],
});

const columnOf = (raw: string): number | undefined => {
  const match = /\[\d+:(\d+)]/.exec(raw);
  return match ? Number(match[1]) : undefined;
};

const plainProblem = (source: string, raw: string): ExprProblem | null => {
  if (raw.startsWith('random()')) return { message: msg('hud-editing:expr.raw', { raw }) };
  if (raw.startsWith('expression is empty')) {
    return { message: msg('hud-editing:expr.empty') };
  }
  if (raw.includes('over the')) {
    return { message: msg('hud-editing:expr.too-long', { max: MAX_EXPR_LENGTH }) };
  }
  if (raw.includes('unexpected TEOF')) return unfinished(source);
  return null;
};

const wordOperatorProblem = (source: string, raw: string, column?: number): ExprProblem | null => {
  if (raw.includes('Unknown character "&"')) {
    return {
      message: msg('hud-editing:expr.and'),
      column,
      fix: { label: msg('hud-editing:expr.fix.and'), expr: source.replace(/&&?/g, 'and') },
    };
  }
  if (raw.includes('Unknown character "|"')) {
    return {
      message: msg('hud-editing:expr.or'),
      column,
      fix: { label: msg('hud-editing:expr.fix.or'), expr: source.replace(/\|\|?/g, 'or') },
    };
  }
  return null;
};

const trailingProblem = (source: string, column?: number): ExprProblem => {
  if (/\bin\b/.test(source)) return { ...disabledFeature('in'), column };
  const product = withProduct(source);
  return {
    message: msg('hud-editing:expr.adjacent'),
    column,
    suggestion: product ? msg('hud-editing:expr.suggest', { suggestion: product }) : undefined,
    fix: product ? { label: msg('hud-editing:expr.fix.multiply'), expr: product } : undefined,
  };
};

const syntaxProblem = (source: string, raw: string, column?: number): ExprProblem | null => {
  if (raw.includes('Expected )')) {
    return { message: msg('hud-editing:expr.unclosed', { call: openParenCall(source) }), column };
  }
  const word = wordOperatorProblem(source, raw, column);
  if (word) return word;
  if (raw.includes('Unknown character "="')) return { ...disabledFeature('assignment'), column };
  if (raw.includes('Unknown character "["')) return { ...disabledFeature('list'), column };
  if (raw.includes('Expected EOF')) return trailingProblem(source, column);
  return null;
};

const explainExprError = (source: string, raw: string): ExprProblem => {
  const column = columnOf(raw);
  return plainProblem(source, raw)
    ?? syntaxProblem(source, raw, column)
    ?? { message: msg('hud-editing:expr.parser', { raw }), column };
};

export { explainExprError };
