/* @layer renderer-components @kind logic */
import { getButtonIconUrl } from '@app/input/button-icons/get-button-icon-url';
import type { OverlaySlot } from '@app/input/pad-overlay/pad-overlay.type';
import type { OverlaySlotView } from '@app/composites/PadOverlay';
import { FALLBACK_GLYPH } from '../ControllerPage.constants';

const glyphHref = (glyph: string): string =>
  (glyph === '' ? '' : (getButtonIconUrl(glyph) ?? getButtonIconUrl(FALLBACK_GLYPH) ?? ''));

const slotViewsOf = (slots: readonly OverlaySlot[]): OverlaySlotView[] =>
  slots.map((slot) => ({ ...slot, glyph: glyphHref(slot.glyph) }));

export { slotViewsOf };
