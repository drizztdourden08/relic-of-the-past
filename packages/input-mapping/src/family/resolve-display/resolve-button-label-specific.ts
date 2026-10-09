/* @layer shared-input @kind logic */
import type { SdlButtonName } from '../family.type';
import type { DisplayContext } from './resolve-display.type';

const resolveButtonLabelSpecific = (ctx: DisplayContext, position: SdlButtonName): string | undefined => {
  return ctx.override?.buttonLabels?.[position] ?? ctx.family.buttonLabels?.[position];
};

export { resolveButtonLabelSpecific };
