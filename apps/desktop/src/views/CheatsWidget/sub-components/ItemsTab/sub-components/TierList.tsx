/* @layer renderer-widgets @kind component */
import { useMemo } from 'react';
import { useGameUIStore } from '@app/stores/game-ui-store';
import { ChoicePopover } from '../../ChoicePopover';
import type { ChoiceOption } from '../../ChoicePopover.type';
import { BOTTLE_NOTICE } from '../ItemsTab.constants';
import { isRemoval } from '../behavior/is-removal';
import { slotValueOf } from '../behavior/slot-value-of';
import type { SlotSpec, SlotWrite, TierListProps, TierOption } from '../ItemsTab.type';

const hexOf = (id: number): string => `0x${id.toString(16).padStart(2, '0')}`;

const optionOf = (spec: SlotSpec, tier: TierOption, current: number, spritesBase: string, write: (w: SlotWrite) => void): ChoiceOption => {
  const base = {
    key: String(tier.value),
    sprite: tier.sprite ? `${spritesBase}${tier.sprite}.png` : null,
    current: tier.value === current,
  };
  if (isRemoval(tier)) {
    return { ...base, label: 'Remove', tone: 'remove', onPick: () => write({ op: 'set', slot: spec.slot, value: 0 }) };
  }
  if (tier.value > current && tier.receiveItemId !== undefined) {
    const receiveItemId = tier.receiveItemId;
    return {
      ...base, label: `Give ${tier.label}`, tone: 'give', hint: hexOf(receiveItemId),
      onPick: () => write({ op: 'give', receiveItemId, label: tier.label }),
    };
  }
  return { ...base, label: `Set ${tier.label}`, tone: 'set', onPick: () => write({ op: 'set', slot: spec.slot, value: tier.value }) };
};

const noop = (): void => undefined;

const TierList = ({ open, spritesBase, write, onClose }: TierListProps) => {
  const { spec, anchor } = open;
  const items = useGameUIStore((s) => s.inventory.items);
  const equipment = useGameUIStore((s) => s.equipment);
  const current = slotValueOf(spec.slot, items, equipment);

  const { title, options } = useMemo(() => {
    if (spec.kind === 'bottle') {
      return { title: 'Bottle', options: [{ key: 'notice', label: BOTTLE_NOTICE, tone: 'plain' as const, onPick: noop }] };
    }
    const held = spec.tiers.find((tier) => tier.value === current) ?? spec.tiers.find((tier) => tier.value > 0);
    return {
      title: held?.label ?? spec.nameKey,
      options: spec.tiers.map((tier) => optionOf(spec, tier, current, spritesBase, write)),
    };
  }, [spec, current, spritesBase, write]);

  return <ChoicePopover title={title} options={options} anchor={anchor} onClose={onClose} />;
};

export { TierList };
