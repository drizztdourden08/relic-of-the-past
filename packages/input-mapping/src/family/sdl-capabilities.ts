/* @layer shared-input @kind logic */
import { buildDisplayContext } from './resolve-display';
import { sdlAxisControls } from './sdl-axis-controls';
import { sdlButtonControls } from './sdl-button-controls';
import type { ResolvedControl } from './family.type';
import type { SdlDeviceCapabilities } from './sdl-capabilities.type';

const resolveDeviceControls = (capabilities: SdlDeviceCapabilities): ResolvedControl[] => {
  const { sdlType, vendorId, productId, overrides } = capabilities;
  const ctx = buildDisplayContext({ sdlType, vendorId, productId, overrides });
  return [...sdlButtonControls(capabilities, ctx), ...sdlAxisControls(capabilities, ctx)];
};

export { resolveDeviceControls };
