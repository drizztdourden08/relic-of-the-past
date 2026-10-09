/* @layer shared-hud @kind logic */
import type { MeasureContext, Scope } from '../engine.type';

const scopeOf = (ctx: MeasureContext): Scope => ctx.scope ?? {};

export { scopeOf };
