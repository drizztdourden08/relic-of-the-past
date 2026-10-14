/* @layer shared-input @kind logic */
import { resolveButtonIcon, resolveButtonLabelSpecific } from './resolve-display';
import type { DisplayContext } from './resolve-display';
import { BUTTON_INDEX, BUTTON_ORDER } from './sdl-capabilities.constants';
import type { ResolvedControl } from './family.type';
import type { SdlDeviceCapabilities } from './sdl-capabilities.type';

const presentLabel = (label: string | undefined): string | undefined => (label === undefined || label === '' ? undefined : label);

const sdlButtonControls = (capabilities: SdlDeviceCapabilities, ctx: DisplayContext): ResolvedControl[] => {
  const { hasButton, buttonLabels } = capabilities;
  const controls: ResolvedControl[] = [];
  for (const entry of BUTTON_ORDER) {
    const index = BUTTON_INDEX[entry.position];
    if (!hasButton[index]) continue;
    const sdlLabel = presentLabel(buttonLabels[index]);
    const genericLabel = ctx.generic.buttonLabels?.[entry.position];
    controls.push({
      position: entry.position,
      kind: 'button',
      label: resolveButtonLabelSpecific(ctx, entry.position) ?? sdlLabel ?? genericLabel ?? entry.position,
      icon: resolveButtonIcon(ctx, entry.position) ?? '',
      category: entry.category,
    });
  }
  return controls;
};

export { sdlButtonControls };
