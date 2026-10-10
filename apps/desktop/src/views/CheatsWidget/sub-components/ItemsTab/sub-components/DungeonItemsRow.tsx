/* @layer renderer-widgets @kind component */
import { Box } from '@drizztdourden08/tessera/primitives';
import { cheatSetDungeonItem } from '@app/game';
import type { DungeonItemKind } from '@app/game';
import { useGameUIStore } from '@app/stores/game-ui-store';
import { PauseEquipSlot, PauseLabel } from '@app/hud';
import { EQUIP_SPRITES } from '@app/composites/PauseEquipSlot';
import { DUNGEON_ITEMS, EQUIP_PANEL } from '../ItemsTab.constants';
import { SlotCell } from './SlotCell';
import type { PanelProps } from '../ItemsTab.type';

const noHover = (): void => undefined;

const DungeonItemsRow = ({ scale, spritesBase }: PanelProps) => {
  const palaceIndex = useGameUIStore((s) => s.map.palaceIndex);
  const progress = useGameUIStore((s) => s.dungeonProgress);
  const tile = 8 * scale;
  const bit = 0x8000 >> (palaceIndex >> 1);
  const held: Record<DungeonItemKind, boolean> = {
    map: (progress.maps & bit) !== 0,
    compass: (progress.compasses & bit) !== 0,
    bigKey: (progress.bigKeys & bit) !== 0,
  };

  return (
    <>
      <Box className="cheats-items__at" style={{ top: tile * EQUIP_PANEL.labelRow, left: 0 }}>
        <PauseLabel name="dungeon-item" tiles={7} scale={scale} spritesBase={spritesBase} />
      </Box>
      {DUNGEON_ITEMS.map(({ kind, type, col, label }) => (
        <SlotCell
          key={kind}
          size={tile * 2}
          owned={held[kind]}
          menu={false}
          ghost={`${spritesBase}${EQUIP_SPRITES[type]?.[1]}.png`}
          title={`${label}: click to ${held[kind] ? 'take away' : 'give'}`}
          style={{ position: 'absolute', top: tile * EQUIP_PANEL.bottomRow, left: tile * col }}
          onClick={() => cheatSetDungeonItem(kind, palaceIndex, !held[kind])}
          onHover={noHover}
        >
          {held[kind] && <PauseEquipSlot type={type} level={1} scale={scale} spritesBase={spritesBase} />}
        </SlotCell>
      ))}
    </>
  );
};

export { DungeonItemsRow };
