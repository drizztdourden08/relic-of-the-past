/* @layer shared-input @kind logic */
import type { SdlAxisName } from '../family.type';
import type { DisplayContext } from './resolve-display.type';

const resolveAxisIcon = (ctx: DisplayContext, position: SdlAxisName): string | undefined => {
  return ctx.override?.axisIcons?.[position] ?? ctx.family.axisIcons?.[position] ?? ctx.generic.axisIcons?.[position];
};

export { resolveAxisIcon };
