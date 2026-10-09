/* @layer shared-input @kind logic */
import type { AxisConsoleDefault, SdlAxisName } from '../family.type';
import type { DisplayContext } from './resolve-display.type';

const resolveAxisConsoleDefault = (ctx: DisplayContext, position: SdlAxisName): AxisConsoleDefault | undefined => {
  return ctx.override?.axisConsoleDefaults?.[position] ?? ctx.family.axisConsoleDefaults?.[position] ?? ctx.generic.axisConsoleDefaults?.[position];
};

export { resolveAxisConsoleDefault };
