/* @layer renderer-widgets @kind types */

/** The four shapes a pause slot takes: held flag, climbing ladder, value pick, or the bottle index. */
type SlotKind = 'flag' | 'ladder' | 'byValue' | 'bottle';

/** Where a slot sits on the tab: the 5x4 grid, the equipment panel, or the abilities row. */
type SlotPlace = 'grid' | 'equipment' | 'ability';

/** One choice in a slot's list. `value` is the raw byte the slot holds at that tier. */
type TierOption = {
  value: number;
  label: string;
  /** Pause-menu sprite filename without extension, or null when the tier draws nothing. */
  sprite: string | null;
  /** Native receive id when this tier can be GIVEN with the receipt animation. */
  receiveItemId?: number;
};

type SlotSpec = {
  /** 0-19 pause save index; 20-26 the CheatSlot numbers for gloves, boots, flippers, pearl, sword, shield, armor. */
  slot: number;
  kind: SlotKind;
  /** The tracker table key the tiers came from; doubles as a stable id. */
  nameKey: string;
  place: SlotPlace;
  tiers: TierOption[];
};

/** What a click resolves to. Give rides the delivery queue; set writes the byte. */
type SlotWrite =
  | { op: 'give'; receiveItemId: number; label: string }
  | { op: 'set'; slot: number; value: number };

/** A slot the tier list is open for, with the element it hangs under. */
type OpenSlot = {
  spec: SlotSpec;
  anchor: HTMLElement;
};

/** What the name panel draws for the slot under the pointer. */
type SlotName = {
  lines: string[];
  sprite: string | null;
  owned: boolean;
};

export type { OpenSlot, SlotKind, SlotName, SlotPlace, SlotSpec, SlotWrite, TierOption };
