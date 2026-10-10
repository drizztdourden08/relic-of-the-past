/* @layer renderer-hud @kind hook */
import { useMemo } from 'react';
import { getItem, spriteFilename } from '@rotp/game-data';
import { useGameUIStore } from '@app/stores/game-ui-store';
import type { DungeonItemCell } from '../../../compounds/PauseStatusScreen';
import { DUNGEON_RECORDS, NO_PALACE, TOP_BIT } from '../EnhancedPauseView.constants';

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
      owned: inDungeon && Boolean(((held[index] ?? 0) << shift) & TOP_BIT),
    }));
  }, [dungeon, palaceIndex]);
};

export { useStatusModel };
