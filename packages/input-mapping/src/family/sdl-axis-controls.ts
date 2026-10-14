/* @layer shared-input @kind logic */
import { resolveAxisIcon, resolveAxisLabel, resolveTriggerPressThreshold } from './resolve-display';
import type { DisplayContext } from './resolve-display';
import { AXIS_INDEX, AXIS_ORDER } from './sdl-capabilities.constants';
import type { ResolvedControl } from './family.type';
import type { SdlDeviceCapabilities } from './sdl-capabilities.type';

const sdlAxisControls = (capabilities: SdlDeviceCapabilities, ctx: DisplayContext): ResolvedControl[] => {
  const { hasAxis } = capabilities;
  const controls: ResolvedControl[] = [];
  for (const entry of AXIS_ORDER) {
    const index = AXIS_INDEX[entry.position];
    if (!hasAxis[index]) continue;
    controls.push({
      position: entry.position,
      kind: 'axis',
      label: resolveAxisLabel(ctx, entry.position) ?? entry.position,
      icon: resolveAxisIcon(ctx, entry.position) ?? '',
      category: entry.category,
      ...(entry.category === 'trigger' ? { pressThreshold: resolveTriggerPressThreshold(ctx) } : {}),
    });
  }
  return controls;
};

export { sdlAxisControls };
