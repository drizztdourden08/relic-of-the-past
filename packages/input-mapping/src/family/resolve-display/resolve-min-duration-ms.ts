/* @layer shared-input @kind logic */
import type { DisplayContext } from './resolve-display.type';

const resolveMinDurationMs = (ctx: DisplayContext): number => {
  return ctx.override?.minDurationMs ?? ctx.family.minDurationMs ?? ctx.generic.minDurationMs ?? 0;
};

export { resolveMinDurationMs };
