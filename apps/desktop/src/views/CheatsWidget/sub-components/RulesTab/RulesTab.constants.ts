/* @layer renderer-widgets @kind constants */
import {
  cheatKillAllEnemies, cheatSetDamageMultiplier, cheatSetExtraArmorPct, cheatSetIgnoreCollision,
  cheatSetIlluminateDarkRooms, cheatUnblockLink, getDamageMultiplier, getExtraArmorPct,
  getIgnoreCollisionEnabled, getIlluminateDarkRoomsEnabled,
} from '@app/game';
import type { ActionTileSpec, RuleTileSpec, RungTileSpec } from './RulesTab.type';

const RULE_TILES: RuleTileSpec[] = [
  {
    id: 'walls', label: 'Walk through walls', name: 'No walls', sprite: 'hud-cape', category: 'collision',
    read: getIgnoreCollisionEnabled, write: cheatSetIgnoreCollision,
  },
  {
    id: 'lights', label: 'Light dark rooms', name: 'Lit rooms', sprite: 'hud-lamp', category: 'stats',
    read: getIlluminateDarkRoomsEnabled, write: cheatSetIlluminateDarkRooms,
  },
];

const RUNG_TILES: RungTileSpec[] = [
  {
    id: 'damage', label: 'Damage dealt', name: 'Damage dealt', sprite: 'hud-master-sword', category: 'combat',
    rungs: [
      { value: 1, label: '1x' }, { value: 2, label: '2x' }, { value: 4, label: '4x' },
      { value: 8, label: '8x' }, { value: 16, label: '16x' }, { value: 248, label: 'OHKO' },
    ],
    read: getDamageMultiplier, write: cheatSetDamageMultiplier,
  },
  {
    id: 'armor', label: 'Damage taken', name: 'Damage taken', sprite: 'hud-red-mail', category: 'combat',
    rungs: [
      { value: 0, label: 'Full' }, { value: 25, label: '-25%' }, { value: 50, label: '-50%' },
      { value: 75, label: '-75%' }, { value: 100, label: 'None' },
    ],
    read: getExtraArmorPct, write: cheatSetExtraArmorPct,
  },
];

const ACTION_TILES: ActionTileSpec[] = [
  { id: 'kill', label: 'Kill all enemies', name: 'Kill all', sprite: 'hud-bombos', category: 'combat', run: cheatKillAllEnemies },
  { id: 'unblock', label: 'Unblock Link', name: 'Unblock', sprite: 'hud-magic-mirror', category: 'collision', run: cheatUnblockLink },
];

export { ACTION_TILES, RULE_TILES, RUNG_TILES };
