/* @layer renderer-widgets @kind constants */
/**
 * The tile tables. One row per tile: the sprite, the gate category, and the getter and
 * setter it is wired to. The getters return module state the setters keep, so a tile
 * reads its value from them on every render.
 */
import {
  cheatKillAllEnemies, cheatSetDamageMultiplier, cheatSetExtraArmorPct, cheatSetIgnoreCollision,
  cheatSetIlluminateDarkRooms, cheatUnblockLink, getDamageMultiplier, getExtraArmorPct,
  getIgnoreCollisionEnabled, getIlluminateDarkRoomsEnabled,
} from '@app/lib/game';
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

const RULES_HINT = 'The art is the label, the box is the state. A category the profile turns off draws inert.';

export { ACTION_TILES, RULES_HINT, RULE_TILES, RUNG_TILES };
