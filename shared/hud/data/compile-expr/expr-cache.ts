/* @layer shared-hud @kind logic */
import type { CompileResult } from './compile-expr.type';

const exprCache = new Map<string, CompileResult>();

export { exprCache };
