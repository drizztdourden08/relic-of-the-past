/* @layer shared-input @kind logic */
import type { ConsoleButton, SdlButtonName } from '../family.type';
import type { DisplayContext } from './resolve-display.type';

const resolveConsoleDefault = (ctx: DisplayContext, position: SdlButtonName): ConsoleButton | undefined => {
  return ctx.override?.consoleDefaults?.[position] ?? ctx.family.consoleDefaults?.[position] ?? ctx.generic.consoleDefaults?.[position];
};

export { resolveConsoleDefault };
