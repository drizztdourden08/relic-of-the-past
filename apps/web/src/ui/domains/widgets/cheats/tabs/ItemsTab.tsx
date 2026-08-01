/* @layer renderer-widgets @kind component */
/**
 * ItemsTab — Give items freely or trigger checks.
 * "Free Give" shows all items grouped by category.
 * "From Check" shows the check list with grant buttons.
 */
import { useState, useMemo, useEffect } from 'react';
import { TextInput, Box, Text, Image, Button } from '../../../../design-system/primitives';
import { find, getItem, getScreen } from '@shared/game/data';
import type { CheckId, ItemRecord, CheckRecord } from '@shared/game/data';
import { getItemSprite } from '@shared/game/logic/queries/item-sprites';
import {
  cheatGiveItem, cheatTriggerCheck, cheatTriggerNpcCheck,
  getCompletedChecks, onCompletedChecksChanged,
} from '../../../../../lib/game';

type Mode = 'free' | 'checks';

const CATEGORY_ORDER = ['weapon', 'equipment', 'medallion', 'bottle', 'upgrade', 'key', 'junk'];
const CATEGORY_LABELS: Record<string, string> = {
  weapon: 'Weapons', equipment: 'Equipment', medallion: 'Medallions',
  bottle: 'Bottles', upgrade: 'Upgrades', key: 'Keys', junk: 'Consumables',
};

const ItemsTab = () => {
  const [mode, setMode] = useState<Mode>('free');
  const [search, setSearch] = useState('');
  const [completedChecks, setCompletedChecks] = useState<Set<CheckId>>(() => getCompletedChecks());

  useEffect(() => onCompletedChecksChanged(checks => setCompletedChecks(new Set(checks))), []);

  // Group items by category — native id 0x00-0x4b only (skip events/crystals/randomizer-only ids)
  const itemsByCategory = useMemo(() => {
    const map = new Map<string, ItemRecord[]>();
    for (const cat of CATEGORY_ORDER) map.set(cat, []);
    const givableItems = find('item', item => {
      const nativeId = item.gameId?.receiveItemId;
      return nativeId !== undefined && nativeId >= 0 && nativeId <= 0x4b;
    });
    for (const item of givableItems) {
      const list = map.get(item.category);
      if (list) list.push(item);
    }
    return map;
  }, []);

  // All checks, sourced from the data facade (not the old checks/ arrays).
  const allChecks = useMemo(() => find('check', () => true), []);

  // Resolves a check's vanilla reward to its native Link_ReceiveItem id, defaulting
  // to the heart-piece id when the check has no reward (or the item is unresolvable).
  const resolveVanillaItemId = (check: CheckRecord): number => {
    const itemId = check.vanillaItemIds[0];
    return itemId ? getItem(itemId).gameId?.receiveItemId ?? 0x17 : 0x17;
  };

  // Screen display label for a check, mirroring the old check.screen slug's role —
  // a handful of pure progress-buffer events carry no screenId at all.
  const checkScreenLabel = (check: CheckRecord): string => {
    if (!check.screenId) return '';
    const screen = getScreen(check.screenId);
    return screen.vanillaName ?? screen.randomizerName;
  };

  // Filter checks by search
  const filteredChecks = useMemo(() => {
    if (!search) return allChecks;
    const q = search.toLowerCase();
    return allChecks.filter(c => c.randomizerName.toLowerCase().includes(q) || checkScreenLabel(c).toLowerCase().includes(q));
  }, [search, allChecks]);

  const handleGrantCheck = (check: CheckRecord) => {
    const { roomId, chestIndex, flagType, flagMask, itemId: npcItemId, spriteType, postGfx } = check.gameId;
    if (check.kind === 'chest' && roomId != null && chestIndex != null) {
      cheatTriggerCheck(roomId, chestIndex, resolveVanillaItemId(check));
    } else if (check.kind === 'npc') {
      if (flagType != null && flagMask != null && npcItemId != null && spriteType != null && postGfx != null) {
        cheatTriggerNpcCheck(flagType, flagMask, npcItemId, spriteType, postGfx);
      }
    } else {
      // For standing/boss/prize/keyDrop/dig/bonk/event kinds:
      // If there's room+chest data, use check trigger; otherwise give item directly
      if (roomId != null && chestIndex != null) {
        cheatTriggerCheck(roomId, chestIndex, resolveVanillaItemId(check));
      }
    }
  };

  return (
    <Box className="cheats-tab-items">
      <Box className="cheats-items__mode-toggle">
        <Button variant={mode === 'free' ? 'secondary' : 'tertiary'} size="sm" onClick={() => setMode('free')}>
          Free Give
        </Button>
        <Button variant={mode === 'checks' ? 'secondary' : 'tertiary'} size="sm" onClick={() => setMode('checks')}>
          From Check
        </Button>
      </Box>

      {mode === 'free' && (
        <Box>
          {CATEGORY_ORDER.map(cat => {
            const items = itemsByCategory.get(cat);
            if (!items || items.length === 0) return null;
            return (
              <Box key={cat}>
                <Box className="cheats-items__category">{CATEGORY_LABELS[cat]}</Box>
                <Box className="cheats-items__grid">
                  {items.map(item => {
                    const nativeId = item.gameId?.receiveItemId ?? 0;
                    const sprite = getItemSprite(item.id);
                    return (
                      <Button
                        variant="tile"
                        key={item.id}
                        className="cheats-item-btn"
                        onClick={() => cheatGiveItem(nativeId)}
                        title={`${item.randomizerName} · 0x${nativeId.toString(16).padStart(2, '0')}`}
                      >
                        {sprite
                          ? <Image className="cheats-item-btn__icon" src={sprite} alt="" draggable={false} />
                          : <Box as="span" className="cheats-item-btn__icon cheats-item-btn__icon--empty">?</Box>}
                        <Text className="cheats-item-btn__label">{item.randomizerName}</Text>
                      </Button>
                    );
                  })}
                </Box>
              </Box>
            );
          })}
        </Box>
      )}

      {mode === 'checks' && (
        <Box>
          <TextInput
            type="text"
            className="cheats-input cheats-search"
            placeholder="Search checks..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          <Box className="cheats-checks__list">
            {filteredChecks.map(check => {
              const done = completedChecks.has(check.id);
              const canTrigger = (check.kind === 'chest' && check.gameId.roomId != null && check.gameId.chestIndex != null)
                || (check.kind === 'npc' && check.gameId.flagType != null)
                || (check.gameId.roomId != null && check.gameId.chestIndex != null);
              return (
                <Box key={check.id} className={`cheats-checks__entry ${done ? 'cheats-checks__entry--completed' : ''}`}>
                  <Text className="cheats-checks__name" title={`${checkScreenLabel(check)} • ${check.kind}`}>
                    {check.randomizerName}
                  </Text>
                  <Button
                    size="sm"
                    className="cheats-checks__grant-btn"
                    disabled={done || !canTrigger}
                    onClick={() => handleGrantCheck(check)}
                  >
                    Grant
                  </Button>
                </Box>
              );
            })}
          </Box>
        </Box>
      )}
    </Box>
  );
};

export { ItemsTab };
