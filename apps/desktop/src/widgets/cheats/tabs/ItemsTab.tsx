/* @layer renderer-widgets @kind component */
/**
 * ItemsTab — Give items freely or trigger checks.
 * "Free Give" shows all items grouped by category.
 * "From Check" shows the check list with grant buttons.
 */
import { useState, useMemo, useEffect } from 'react';
import { ITEMS } from '@shared/game/items';
import { ALL_CHECKS } from '@shared/game/checks';
import { CHECK_NPC_FLAGS } from '@shared/game/checks/flags';
import { CHECK_ROOM_FLAGS } from '@shared/game/checks/flags';
import type { CheckDefinition } from '@shared/game/types';
import {
  cheatGiveItem, cheatTriggerCheck, cheatTriggerNpcCheck,
  getCompletedChecks, onCompletedChecksChanged,
} from '../../../lib/game';

type Mode = 'free' | 'checks';

const CATEGORY_ORDER = ['weapon', 'equipment', 'medallion', 'bottle', 'upgrade', 'key', 'junk'];
const CATEGORY_LABELS: Record<string, string> = {
  weapon: 'Weapons', equipment: 'Equipment', medallion: 'Medallions',
  bottle: 'Bottles', upgrade: 'Upgrades', key: 'Keys', junk: 'Consumables',
};

const ItemsTab = () => {
  const [mode, setMode] = useState<Mode>('free');
  const [search, setSearch] = useState('');
  const [completedChecks, setCompletedChecks] = useState<Set<string>>(() => getCompletedChecks());

  useEffect(() => onCompletedChecksChanged(checks => setCompletedChecks(new Set(checks))), []);

  // Group items by category
  const itemsByCategory = useMemo(() => {
    const map = new Map<string, typeof ITEMS>();
    for (const cat of CATEGORY_ORDER) map.set(cat, []);
    for (const item of ITEMS) {
      if (item.id < 0 || item.id > 0x4b) continue; // Skip events/crystals/randomizer-only IDs
      const list = map.get(item.category);
      if (list) list.push(item);
    }
    return map;
  }, []);

  // Filter checks by search
  const filteredChecks = useMemo(() => {
    if (!search) return ALL_CHECKS;
    const q = search.toLowerCase();
    return ALL_CHECKS.filter(c => c.name.toLowerCase().includes(q) || c.screen.toLowerCase().includes(q));
  }, [search]);

  const handleGrantCheck = (check: CheckDefinition) => {
    if (check.type === 'chest' && check.roomId != null && check.chestIndex != null) {
      // Resolve vanilla item ID for this check
      const vanillaItemName = Array.isArray(check.vanillaItem) ? check.vanillaItem[0] : check.vanillaItem;
      const itemDef = vanillaItemName ? ITEMS.find(i => i.name === vanillaItemName) : null;
      const itemId = itemDef?.id ?? 0x17; // Default to heart piece if unknown
      cheatTriggerCheck(check.roomId, check.chestIndex, itemId);
    } else if (check.type === 'npc') {
      const npcConfig = CHECK_NPC_FLAGS[check.name];
      if (npcConfig) {
        cheatTriggerNpcCheck(npcConfig.flagType, npcConfig.flagMask, npcConfig.itemId, npcConfig.spriteType, npcConfig.postGfx);
      }
    } else {
      // For standing/boss/prize/keyDrop/dig/bonk/event types:
      // If there's room+chest data, use check trigger; otherwise give item directly
      if (check.roomId != null && check.chestIndex != null) {
        const vanillaItemName = Array.isArray(check.vanillaItem) ? check.vanillaItem[0] : check.vanillaItem;
        const itemDef = vanillaItemName ? ITEMS.find(i => i.name === vanillaItemName) : null;
        const itemId = itemDef?.id ?? 0x17;
        cheatTriggerCheck(check.roomId, check.chestIndex, itemId);
      }
    }
  };

  return (
    <div className="cheats-tab-items">
      <div className="cheats-items__mode-toggle">
        <button
          className={`cheats-radio ${mode === 'free' ? 'cheats-radio--active' : ''}`}
          onClick={() => setMode('free')}
        >
          Free Give
        </button>
        <button
          className={`cheats-radio ${mode === 'checks' ? 'cheats-radio--active' : ''}`}
          onClick={() => setMode('checks')}
        >
          From Check
        </button>
      </div>

      {mode === 'free' && (
        <div>
          {CATEGORY_ORDER.map(cat => {
            const items = itemsByCategory.get(cat);
            if (!items || items.length === 0) return null;
            return (
              <div key={cat}>
                <div className="cheats-items__category">{CATEGORY_LABELS[cat]}</div>
                <div className="cheats-items__grid">
                  {items.map(item => (
                    <button
                      key={item.id}
                      className="cheats-items__item"
                      onClick={() => cheatGiveItem(item.id)}
                      title={`ID: 0x${item.id.toString(16).padStart(2, '0')}`}
                    >
                      {item.name}
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {mode === 'checks' && (
        <div>
          <input
            type="text"
            className="cheats-input"
            style={{ width: '100%', marginBottom: 8, textAlign: 'left' }}
            placeholder="Search checks..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          <div className="cheats-checks__list">
            {filteredChecks.map(check => {
              const done = completedChecks.has(check.id);
              const canTrigger = (check.type === 'chest' && check.roomId != null && check.chestIndex != null)
                || (check.type === 'npc' && CHECK_NPC_FLAGS[check.name] != null)
                || (check.roomId != null && check.chestIndex != null);
              return (
                <div key={check.id} className={`cheats-checks__entry ${done ? 'cheats-checks__entry--completed' : ''}`}>
                  <span className="cheats-checks__name" title={`${check.screen} • ${check.type}`}>
                    {check.name}
                  </span>
                  <button
                    className="cheats-checks__grant-btn"
                    disabled={done || !canTrigger}
                    onClick={() => handleGrantCheck(check)}
                  >
                    Grant
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export { ItemsTab };
