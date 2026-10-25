/* @layer shared-input @kind logic */
import type { DisplayContext } from '@drizztdourden08/brock-input';
import type { SdlAxisName } from '@rotp/game-data';
import { GENERIC_DEFAULTS, SNES_CONSOLE_DEFAULTS } from './snes-console-defaults.constants';
import type { AxisConsoleDefault } from './snes-console-defaults.type';

const resolveAxisConsoleDefault = (ctx: DisplayContext, position: SdlAxisName): AxisConsoleDefault | undefined => {
  return SNES_CONSOLE_DEFAULTS.get(ctx.family)?.axes?.[position] ?? GENERIC_DEFAULTS.axes?.[position];
};

export { resolveAxisConsoleDefault };
