/* @layer renderer-components @kind logic */
/**
 * Which control the opened-slot count is shown with, and what it says.
 *
 * A slider makes two promises: that the value can be dragged, and that the
 * filled part of its track means something. Only the counted modes keep them.
 * They take a NUMBER out of the ticked set, so the fill is the share of that
 * set this scope opens and the thumb is the player's own choice.
 *
 * The other modes keep neither. The custom mode's opened set IS the ticked
 * set, so the value equals the maximum by definition: the bar sits hard
 * against the end however many slots are ticked, and unticking one drops the
 * number while the fill does not move at all. Vanilla opens nothing and reads
 * nothing. Both of those are a read-out — the same label, the same sentence,
 * the same figure, without a control that cannot be moved and a bar that
 * cannot be wrong in an interesting way.
 */
import {
  SLOT_COUNT_FOLLOWS_TICKS, SLOT_COUNT_INERT, slotCountCeiling,
} from '../ShopSlotsBlock.constants';
import type { ShopScopeSummary } from './shop-scope-edits';

/** The count is a choice inside the ticked ceiling: a real, draggable slider. */
interface ShopCountSlider {
  kind: 'slider';
  value: number;
  /** The ticked ceiling, floored at one so the track is never zero-width. */
  max: number;
  description: string;
}

/** The ticks alone decide the count: a static figure, no track at all. */
interface ShopCountReadout {
  kind: 'readout';
  /** The opened set against the ticked one, spelled out rather than drawn. */
  value: string;
  description: string;
}

type ShopCountControl = ShopCountSlider | ShopCountReadout;

const shopCountControlOf = (summary: ShopScopeSummary): ShopCountControl => {
  const { active, counts, opened, ticked } = summary;
  if (counts) {
    return { kind: 'slider', value: opened, max: Math.max(ticked, 1), description: slotCountCeiling(ticked) };
  }
  return {
    kind: 'readout',
    value: `${opened} of ${ticked}`,
    description: active ? SLOT_COUNT_FOLLOWS_TICKS : SLOT_COUNT_INERT,
  };
};

export { shopCountControlOf };
export type { ShopCountControl, ShopCountReadout, ShopCountSlider };
