/* @layer shared-input @kind logic */
import type { DisplayContext } from './resolve-display.type';

const resolveDeviceName = (ctx: DisplayContext, sdlName: string): string => {
  const rename = ctx.override?.deviceName ?? ctx.family.deviceName ?? ctx.generic.deviceName;
  return rename ? rename(sdlName) : sdlName;
};

export { resolveDeviceName };
