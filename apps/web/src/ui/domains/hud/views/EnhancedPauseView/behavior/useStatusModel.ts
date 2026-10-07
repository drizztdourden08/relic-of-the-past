/* @layer renderer-hud @kind hook */
/**
 * The status screen's dungeon row: map, compass and great key for wherever the
 * player is standing.
 *
 * The three flags are per-dungeon bitmasks and the current dungeon is a doubled
 * palace index, so the test is the core's own: shift the mask up by half that
 * index and read the top bit. Outside a dungeon there is nothing to report, so
 * all three fall to silhouettes instead of vanishing. The row keeps its shape
 * and says "not here" instead of leaving a hole where an answer belongs.
 */
import { useMemo } from 'react';
import { getItem } from '@shared/game/data';
import { spriteFilename } from '@shared/game/logic/queries/item-sprites';
import { useGameUIStore } from '@app/stores/game-ui-store';
import type { DungeonItemCell } from '../../../compounds/PauseStatusScreen';

/** Map, compass, great key, in the order the row draws them. */
const DUNGEON_RECORDS: readonly string[] = ['item-052', 'item-038', 'item-051'];

/** No dungeon: the core parks the palace index at 0xff. */
const NO_PALACE = 0xff;
/** The masks are 16 bits with dungeon 0 at the top. */
const TOP_BIT = 0x8000;

const spriteOf = (recordId: string): string => spriteFilename(getItem(recordId).spriteId) ?? '';

const useStatusModel = (): readonly DungeonItemCell[] => {
  const dungeon = useGameUIStore((s) => s.dungeonProgress);
  const palaceIndex = useGameUIStore((s) => s.map.palaceIndex);

  return useMemo(() => {
    const inDungeon = palaceIndex !== NO_PALACE;
    const shift = palaceIndex >> 1;
    const held = [dungeon.maps, dungeon.compasses, dungeon.bigKeys];
    return DUNGEON_RECORDS.map((recordId, index) => ({
      sprite: spriteOf(recordId),
      owned: inDungeon && !!((held[index] << shift) & TOP_BIT),
    }));
  }, [dungeon, palaceIndex]);
};

export { useStatusModel };
