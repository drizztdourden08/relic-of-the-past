/* @layer renderer-widgets @kind hook */
import { useCallback, useState } from 'react';
import type { MouseEvent } from 'react';
import { givableTier } from './givable-tier';
import type { Flash, SlotClickParams, SlotSpec } from '../ItemsTab.type';

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

  const flashKey = useCallback((slot: number): string =>
    `${slot}:${flash?.slot === slot ? flash.n : 0}`, [flash]);

  const isFlashing = useCallback((slot: number): boolean => flash?.slot === slot, [flash]);

  return { click, flashKey, isFlashing };
};

export { useSlotClick };
