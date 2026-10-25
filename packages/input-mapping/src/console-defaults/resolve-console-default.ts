/* @layer shared-input @kind logic */
import type { DisplayContext } from '@drizztdourden08/brock-input';
import type { SdlButtonName, SnesButton } from '@rotp/game-data';
import { GENERIC_DEFAULTS, SNES_CONSOLE_DEFAULTS } from './snes-console-defaults.constants';

const resolveConsoleDefault = (ctx: DisplayContext, position: SdlButtonName): SnesButton | undefined => {
  return SNES_CONSOLE_DEFAULTS.get(ctx.family)?.buttons[position] ?? GENERIC_DEFAULTS.buttons[position];
};

export { resolveConsoleDefault };
