/* @layer shared-input @kind logic */
import type { SdlButtonName } from '../family.type';
import type { DisplayContext } from './resolve-display.type';

const resolveButtonLabel = (ctx: DisplayContext, position: SdlButtonName): string | undefined => {
  return ctx.override?.buttonLabels?.[position] ?? ctx.family.buttonLabels?.[position] ?? ctx.generic.buttonLabels?.[position];
};

export { resolveButtonLabel };
