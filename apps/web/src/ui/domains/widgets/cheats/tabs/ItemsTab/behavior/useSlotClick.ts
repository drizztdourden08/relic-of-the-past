/* @layer renderer-widgets @kind hook */
/**
 * What a click on a slot does: an owned slot (and the bottle slot) opens its list under the
 * cell; an unowned one gives its first tier and flashes. The flash is a counter per slot, so
 * the cell can remount and restart its animation on every give.
 */
import { useCallback, useState } from 'react';
import type { MouseEvent } from 'react';
import type { OpenSlot, SlotSpec, SlotWrite, TierOption } from '../ItemsTab.type';

type SlotClickParams = {
  onOpen: (open: OpenSlot) => void;
  write: (write: SlotWrite) => void;
};

type Flash = { slot: number; n: number } | null;

/** The tier a ghost click gives: the lowest one the receipt can hand over. */
const givableTier = (spec: SlotSpec): TierOption | undefined =>
  spec.tiers.find((tier) => tier.value > 0 && tier.receiveItemId !== undefined);

const useSlotClick = ({ onOpen, write }: SlotClickParams) => {
  const [flash, setFlash] = useState<Flash>(null);

  const click = useCallback((spec: SlotSpec, owned: boolean, e: MouseEvent<HTMLButtonElement>): void => {
    if (owned || spec.kind === 'bottle') {
      onOpen({ spec, anchor: e.currentTarget });
      return;
    }
    const tier = givableTier(spec);
    if (!tier || tier.receiveItemId === undefined) return;
    write({ op: 'give', receiveItemId: tier.receiveItemId, label: tier.label });
    setFlash((prev) => ({ slot: spec.slot, n: (prev?.n ?? 0) + 1 }));
  }, [onOpen, write]);

  /** The remount key for a cell: changes once per give on that slot. */
  const flashKey = useCallback((slot: number): string =>
    `${slot}:${flash?.slot === slot ? flash.n : 0}`, [flash]);

  const isFlashing = useCallback((slot: number): boolean => flash?.slot === slot, [flash]);

  return { click, flashKey, isFlashing };
};

export { givableTier, useSlotClick };
