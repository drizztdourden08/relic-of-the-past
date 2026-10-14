/* @layer renderer-widgets @kind component */
import { Text } from '@drizztdourden08/tessera/primitives';
import { PauseItemSlot } from '@app/hud';
import { getSlotSprite } from '@app/composites/PauseItemSlot';
import { BOTTLE_SLOT_INDEX, EMPTY_BOTTLE } from '../ItemsTab.constants';
import { givableTier } from '../behavior/givable-tier';
import { SlotCell } from './SlotCell';
import type { ItemGridCellProps, SlotSpec } from '../ItemsTab.type';

const ghostSpriteOf = (spec: SlotSpec): string | null =>
  (spec.kind === 'bottle' ? getSlotSprite(BOTTLE_SLOT_INDEX, EMPTY_BOTTLE) : (givableTier(spec)?.sprite ?? null));

const ItemGridCell = (props: ItemGridCellProps) => {
  const { slot, spec, value, shown, selected, flash, scale, spritesBase, onClick, onOpen, onHover } = props;
  const owned = value > 0;
  const tierMark = spec.kind !== 'flag' && spec.kind !== 'bottle' && value > 1;
  const ghost = ghostSpriteOf(spec);

  return (
    <SlotCell
      size={8 * scale * 2}
      owned={owned}
      menu={owned}
      ghost={ghost ? `${spritesBase}${ghost}.png` : null}
      title={spec.tiers.find((tier) => tier.value === value)?.label ?? givableTier(spec)?.label ?? spec.nameKey}
      flash={flash}
      onClick={(e) => onClick(spec, owned, e)}
      onOpenList={(e) => onOpen({ spec, anchor: e.currentTarget })}
      onHover={(active) => onHover(active ? slot : null)}
    >
      <PauseItemSlot
        saveSlotIndex={slot}
        itemValue={shown}
        selected={selected}
        animate={false}
        scale={scale}
        spritesBase={spritesBase}
      />
      {tierMark && <Text className="cheats-items__tier">{value}</Text>}
    </SlotCell>
  );
};

export { ItemGridCell };
