/* @layer shared-input @kind logic */
import type { SdlAxisName } from '../family.type';
import type { DisplayContext } from './resolve-display.type';

const resolveAxisLabel = (ctx: DisplayContext, position: SdlAxisName): string | undefined => {
  return ctx.override?.axisLabels?.[position] ?? ctx.family.axisLabels?.[position] ?? ctx.generic.axisLabels?.[position];
};

export { resolveAxisLabel };
