/* @layer shared-input @kind logic */
import type { SdlButtonName } from '../family.type';
import type { DisplayContext } from './resolve-display.type';

const resolveButtonIcon = (ctx: DisplayContext, position: SdlButtonName): string | undefined => {
  return ctx.override?.buttonIcons?.[position] ?? ctx.family.buttonIcons?.[position] ?? ctx.generic.buttonIcons?.[position];
};

export { resolveButtonIcon };
