/* @layer renderer-widgets @kind component */
/**
 * The pause menu's A box: the ability words on top, read-only, and the four passives along the
 * bottom row (boots, gloves, flippers, moon pearl), each clickable. Gloves open their tier
 * list; the other three are a held flag: a ghost click gives, the list offers Remove.
 */
import { Box } from '@ds/primitives';
import { useGameUIStore } from '@app/stores/game-ui-store';
import { PauseBorderBox, PauseButtonLabel, PauseEquipSlot, PauseLabel } from '@domains/hud';
import { CheatSlot } from '@app/lib/game';
import { ABILITY_PANEL, ABILITY_SLOT_ORDER } from '../ItemsTab.constants';
import { isSlotOwned, slotValueOf } from '../behavior/slot-value';
import { givableTier, useSlotClick } from '../behavior/useSlotClick';
import { AbilityTextGrid } from './AbilityTextGrid';
import { SlotCell } from './SlotCell';
import type { OpenSlot, SlotSpec, SlotWrite } from '../ItemsTab.type';

type AbilitiesEditorProps = {
  specs: Map<number, SlotSpec>;
  scale: number;
  spritesBase: string;
  onHover: (slot: number | null) => void;
  onOpen: (open: OpenSlot) => void;
  write: (write: SlotWrite) => void;
};

const EQUIP_TYPE: Record<number, string> = {
  [CheatSlot.Boots]: 'boots', [CheatSlot.Gloves]: 'gloves', [CheatSlot.Flippers]: 'flippers', [CheatSlot.MoonPearl]: 'moonPearl',
};

const AbilitiesEditor = ({ specs, scale, spritesBase, onHover, onOpen, write }: AbilitiesEditorProps) => {
  const items = useGameUIStore((s) => s.inventory.items);
  const equipment = useGameUIStore((s) => s.equipment);
  const { click, flashKey, isFlashing } = useSlotClick({ onOpen, write });
  const tile = 8 * scale;

  return (
    <Box className="cheats-items__panel">
      <PauseBorderBox color="red" cols={ABILITY_PANEL.cols} rows={ABILITY_PANEL.rows} scale={scale} spritesBase={spritesBase}>
        <Box className="cheats-items__corner">
          <PauseButtonLabel button="a" scale={scale} spritesBase={spritesBase} />
        </Box>
        <AbilityTextGrid scale={scale} spritesBase={spritesBase} />
        <Box
          className="cheats-items__passives"
          style={{ top: tile * ABILITY_PANEL.slotRow, left: tile * ABILITY_PANEL.left, width: tile * ABILITY_PANEL.width }}
        >
          {ABILITY_SLOT_ORDER.map((slot) => {
            const spec = specs.get(slot);
            if (!spec) return null;
            const value = slotValueOf(slot, items, equipment);
            const owned = isSlotOwned(slot, value);
            const ghost = givableTier(spec)?.sprite ?? null;
            return (
              <SlotCell
                key={flashKey(slot)}
                size={tile * 2}
                owned={owned}
                menu={owned}
                ghost={ghost ? `${spritesBase}${ghost}.png` : null}
                title={spec.tiers.find((tier) => tier.value === value)?.label ?? givableTier(spec)?.label ?? spec.nameKey}
                flash={isFlashing(slot)}
                onClick={(e) => click(spec, owned, e)}
                onOpenList={(e) => onOpen({ spec, anchor: e.currentTarget })}
                onHover={(active) => onHover(active ? slot : null)}
              >
                {owned && <PauseEquipSlot type={EQUIP_TYPE[slot]} level={value} scale={scale} spritesBase={spritesBase} />}
              </SlotCell>
            );
          })}
        </Box>
      </PauseBorderBox>
      <Box className="cheats-items__label" style={{ left: tile * ABILITY_PANEL.left }}>
        <PauseLabel name="do" tiles={2} scale={scale} spritesBase={spritesBase} />
      </Box>
    </Box>
  );
};

export { AbilitiesEditor };
export type { AbilitiesEditorProps };
