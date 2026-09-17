/* @layer renderer-widgets @kind component */
/**
 * The D.ITEMS row of the EQUIP box, shown inside a dungeon: map, compass and big key for the
 * dungeon Link stands in. Each is a toggle; an unowned one draws as a ghost.
 */
import { Box } from '@ds/primitives';
import { cheatSetDungeonItem } from '@app/lib/game';
import type { DungeonItemKind } from '@app/lib/game';
import { useGameUIStore } from '@app/stores/game-ui-store';
import { PauseEquipSlot, PauseLabel } from '@domains/hud';
import { EQUIP_SPRITES } from '@domains/hud/composites/PauseEquipSlot';
import { DUNGEON_ITEM_COLUMNS, EQUIP_PANEL } from '../ItemsTab.constants';
import { SlotCell } from './SlotCell';

type DungeonItemsRowProps = {
  scale: number;
  spritesBase: string;
};

type DungeonItem = { kind: DungeonItemKind; type: string; col: number; label: string };

const DUNGEON_ITEMS: DungeonItem[] = [
  { kind: 'map', type: 'dungeonMap', col: DUNGEON_ITEM_COLUMNS.map, label: 'Map' },
  { kind: 'compass', type: 'compass', col: DUNGEON_ITEM_COLUMNS.compass, label: 'Compass' },
  { kind: 'bigKey', type: 'bigKey', col: DUNGEON_ITEM_COLUMNS.bigKey, label: 'Big Key' },
];

const noHover = (): void => undefined;

const DungeonItemsRow = ({ scale, spritesBase }: DungeonItemsRowProps) => {
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
          ghost={`${spritesBase}${EQUIP_SPRITES[type][1]}.png`}
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
export type { DungeonItemsRowProps };
