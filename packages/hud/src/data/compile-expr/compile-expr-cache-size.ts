/* @layer shared-hud @kind logic */
import { exprCache } from './expr-cache';

const compileExprCacheSize = (): number => exprCache.size;

export { compileExprCacheSize };
