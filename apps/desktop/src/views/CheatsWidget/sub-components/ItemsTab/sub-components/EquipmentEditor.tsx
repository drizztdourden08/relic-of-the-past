/* @layer renderer-widgets @kind component */
import type { MouseEvent } from 'react';
import { Box, Image } from '@drizztdourden08/tessera/primitives';
import { cheatSetInventorySlot, CheatSlot } from '@app/game';
import { useGameUIStore } from '@app/stores/game-ui-store';
import { PauseBorderBox, PauseEquipSlot, PauseLabel } from '@app/hud';
import { EQUIP_PANEL, GEAR, HEART_PIECE_COLUMN, HEART_PIECE_MAX, NOT_IN_DUNGEON } from '../ItemsTab.constants';
import { isSlotOwned, slotValueOf } from '../behavior/slot-value';
import { DungeonItemsRow } from './DungeonItemsRow';
import { SlotCell } from './SlotCell';
import type { SlotPanelProps, SlotSpec } from '../ItemsTab.type';

const noHover = (): void => undefined;

const EquipmentEditor = ({ specs, scale, spritesBase, onHover, onOpen }: SlotPanelProps) => {
  const items = useGameUIStore((s) => s.inventory.items);
  const equipment = useGameUIStore((s) => s.equipment);
  const palaceIndex = useGameUIStore((s) => s.map.palaceIndex);
  const tile = 8 * scale;
  const inDungeon = palaceIndex !== NOT_IN_DUNGEON;
  const nextHeartPieces = (equipment.heartPieces + 1) % (HEART_PIECE_MAX + 1);

  const openSlot = (spec: SlotSpec) => (e: MouseEvent<HTMLButtonElement>) => onOpen({ spec, anchor: e.currentTarget });

  return (
    <PauseBorderBox color="yellow" cols={EQUIP_PANEL.cols} rows={EQUIP_PANEL.rows} scale={scale} spritesBase={spritesBase}>
      <Box className="cheats-items__corner">
        <PauseLabel name="equipment" tiles={5} scale={scale} spritesBase={spritesBase} />
      </Box>

      {GEAR.map(({ slot, type, col }) => {
        const spec = specs.get(slot);
        if (!spec) return null;
        const value = slotValueOf(slot, items, equipment);
        const owned = isSlotOwned(slot, value);
        const ghost = spec.tiers.find((tier) => tier.value > 0)?.sprite ?? null;
        return (
          <SlotCell
            key={slot}
            size={tile * 2}
            owned={owned}
            menu
            ghost={ghost ? `${spritesBase}${ghost}.png` : null}
            title={spec.tiers.find((tier) => tier.value === value)?.label ?? spec.nameKey}
            style={{ position: 'absolute', top: tile * EQUIP_PANEL.itemRow, left: tile * col }}
            onClick={openSlot(spec)}
            onOpenList={openSlot(spec)}
            onHover={(active) => onHover(active ? slot : null)}
          >
            {owned && <PauseEquipSlot type={type} level={value} scale={scale} spritesBase={spritesBase} />}
          </SlotCell>
        );
      })}

      <Box className="cheats-items__rule" style={{ top: tile * EQUIP_PANEL.ruleRow, width: tile * EQUIP_PANEL.cols, height: tile }}>
        {Array.from({ length: EQUIP_PANEL.cols }, (_, i) => (
          <Image key={i} src={`${spritesBase}font-dot.png`} alt="" draggable={false} width={tile} height={tile} className="cheats-items__pixel" />
        ))}
      </Box>

      {inDungeon ? (
        <DungeonItemsRow scale={scale} spritesBase={spritesBase} />
      ) : (
        <SlotCell
          size={tile * 2}
          owned
          menu={false}
          ghost={null}
          title={`Heart pieces ${equipment.heartPieces}/${HEART_PIECE_MAX + 1}: click to cycle`}
          style={{ position: 'absolute', top: tile * EQUIP_PANEL.bottomRow, left: tile * HEART_PIECE_COLUMN }}
          onClick={() => cheatSetInventorySlot(CheatSlot.HeartPieces, nextHeartPieces)}
          onHover={noHover}
        >
          <PauseEquipSlot type="heartPiece" level={equipment.heartPieces} scale={scale} spritesBase={spritesBase} />
        </SlotCell>
      )}
    </PauseBorderBox>
  );
};

export { EquipmentEditor };
