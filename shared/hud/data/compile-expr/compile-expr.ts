/* @layer shared-hud @kind logic */
import { compileFresh } from './compile-fresh';
import { exprCache } from './expr-cache';
import type { CompileResult } from './compile-expr.type';

const compileExpr = (source: string): CompileResult => {
  const cached = exprCache.get(source);
  if (cached) return cached;
  const result = compileFresh(source);
  exprCache.set(source, result);
  return result;
};

export { compileExpr };
