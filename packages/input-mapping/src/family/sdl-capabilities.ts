/* @layer shared-input @kind logic */
import {
  buildDisplayContext,
  resolveAxisIcon,
  resolveAxisLabel,
  resolveButtonIcon,
  resolveButtonLabelSpecific,
  resolveTriggerPressThreshold,
} from './resolve-display';
import { AXIS_INDEX, AXIS_ORDER, BUTTON_INDEX, BUTTON_ORDER } from './sdl-capabilities.constants';
import type { ResolvedControl } from './family.type';
import type { SdlDeviceCapabilities } from './sdl-capabilities.type';

const resolveDeviceControls = (capabilities: SdlDeviceCapabilities): ResolvedControl[] => {
  const { sdlType, vendorId, productId, hasButton, hasAxis, buttonLabels, overrides } = capabilities;
  const ctx = buildDisplayContext({ sdlType, vendorId, productId, overrides });
  const controls: ResolvedControl[] = [];

  for (const entry of BUTTON_ORDER) {
    const index = BUTTON_INDEX[entry.position];
    if (!hasButton[index]) continue;
    const sdlLabel = buttonLabels[index] || undefined;
    const genericLabel = ctx.generic.buttonLabels?.[entry.position];
    controls.push({
      position: entry.position,
      kind: 'button',
      label: resolveButtonLabelSpecific(ctx, entry.position) ?? sdlLabel ?? genericLabel ?? entry.position,
      icon: resolveButtonIcon(ctx, entry.position) ?? '',
      category: entry.category,
    });
  }

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

export { resolveDeviceControls };
