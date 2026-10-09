/* @layer shared-input @kind logic */
import type { DisplayContext } from './resolve-display.type';

const resolveBrandLogoKey = (ctx: DisplayContext): string => {
  return ctx.override?.brandLogoKey ?? ctx.family.brandLogoKey ?? ctx.generic.brandLogoKey ?? '';
};

export { resolveBrandLogoKey };
