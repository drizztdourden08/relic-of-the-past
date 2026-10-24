/* @layer renderer-lib @kind logic */
import { gamepadInputIcon } from '@drizztdourden08/tessera/primitives';
import type { InputIconFamily, InputIconSource } from '@drizztdourden08/tessera/primitives';
import { FALLBACK_ICON_FAMILY, SDL_BUTTON_IDS } from './glyph-icon.constants';
import { glyphIcon } from './glyph-icon';
import type { OverlaySlot, PositionIcons } from './pad-overlay.type';
import { slotPositions } from './slot-positions';

const sdlIdOf = (position: string): string => SDL_BUTTON_IDS[position] ?? position.toLowerCase().replaceAll('_', '');

const positionIconsOf = (slots: readonly OverlaySlot[], positions: Iterable<string>): PositionIcons => {
  const fromSlots = new Map<string, InputIconSource>();
  let family: InputIconFamily | null = null;
  for (const slot of slots) {
    const icon = glyphIcon(slot.glyph);
    if (!icon) continue;
    family ??= icon.family;
    for (const position of slotPositions(slot)) fromSlots.set(position, icon);
  }
  const icons: Record<string, InputIconSource> = {};
  for (const position of positions) {
    const icon = fromSlots.get(position) ?? gamepadInputIcon(family ?? FALLBACK_ICON_FAMILY, sdlIdOf(position));
    if (icon) icons[position] = icon;
  }
  return icons;
};

export { positionIconsOf };
