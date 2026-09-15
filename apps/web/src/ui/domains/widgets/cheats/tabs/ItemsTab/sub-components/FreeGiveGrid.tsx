/* @layer renderer-widgets @kind component */
/** Every item the core can grant directly, grouped by category. */
import { useMemo } from 'react';
import { Box, Button, Image, Text } from '@ds/primitives';
import { find } from '@shared/game/data';
import type { ItemRecord } from '@shared/game/data';
import { getItemSprite } from '@shared/game/logic/queries/item-sprites';
import { cheatGiveItem } from '@app/lib/game';
import {
  CATEGORY_LABELS, CATEGORY_ORDER, GIVABLE_ID_MAX, GIVABLE_ID_MIN,
} from '../ItemsTab.constants';

const EMPTY_ICON = <Box as="span" className="cheats-item-btn__icon cheats-item-btn__icon--empty">?</Box>;

const FreeGiveGrid = () => {
  const itemsByCategory = useMemo(() => {
    const map = new Map<string, ItemRecord[]>();
    for (const cat of CATEGORY_ORDER) map.set(cat, []);
    const givableItems = find('item', (item) => {
      const nativeId = item.gameId?.receiveItemId;
      return nativeId !== undefined && nativeId >= GIVABLE_ID_MIN && nativeId <= GIVABLE_ID_MAX;
    });
    for (const item of givableItems) map.get(item.category)?.push(item);
    return map;
  }, []);

  return (
    <Box>
      {CATEGORY_ORDER.map((cat) => {
        const items = itemsByCategory.get(cat);
        if (!items || items.length === 0) return null;
        return (
          <Box key={cat}>
            <Box className="cheats-items__category">{CATEGORY_LABELS[cat]}</Box>
            <Box className="cheats-items__grid">
              {items.map((item) => {
                const nativeId = item.gameId?.receiveItemId ?? 0;
                const sprite = getItemSprite(item.id);
                const hex = `0x${nativeId.toString(16).padStart(2, '0')}`;
                return (
                  <Button
                    variant="tile"
                    key={item.id}
                    className="cheats-item-btn"
                    onClick={() => cheatGiveItem(nativeId)}
                    title={`${item.randomizerName} · ${hex}`}
                  >
                    {sprite
                      ? <Image className="cheats-item-btn__icon" src={sprite} alt="" draggable={false} fallback={EMPTY_ICON} />
                      : EMPTY_ICON}
                    <Text className="cheats-item-btn__label">{item.randomizerName}</Text>
                  </Button>
                );
              })}
            </Box>
          </Box>
        );
      })}
    </Box>
  );
};

export { FreeGiveGrid };
