/* @layer renderer-widgets @kind constants */
import {
  cheatKillAllEnemies, cheatSetDamageMultiplier, cheatSetExtraArmorPct, cheatSetIgnoreCollision,
  cheatSetIlluminateDarkRooms, cheatUnblockLink, getDamageMultiplier, getExtraArmorPct,
  getIgnoreCollisionEnabled, getIlluminateDarkRoomsEnabled,
} from '@app/game';
import { msg } from '@drizztdourden08/brock-core/i18n';
import type { Message } from '@drizztdourden08/brock-core/i18n';
import type { ActionTileSpec, RuleTileSpec, RungTileSpec } from './RulesTab.type';

const multiplier = (n: number): Message => msg('views-cheats:rung.multiplier', { n });
const reduction = (n: number): Message => msg('views-cheats:rung.reduction', { n });

const RULE_TILES: RuleTileSpec[] = [
  {
    id: 'walls', label: msg('views-cheats:rules.walls.label'), name: msg('views-cheats:rules.walls.name'), sprite: 'hud-cape', category: 'collision',
    read: getIgnoreCollisionEnabled, write: cheatSetIgnoreCollision,
  },
  {
    id: 'lights', label: msg('views-cheats:rules.lights.label'), name: msg('views-cheats:rules.lights.name'), sprite: 'hud-lamp', category: 'stats',
    read: getIlluminateDarkRoomsEnabled, write: cheatSetIlluminateDarkRooms,
  },
];

const RUNG_TILES: RungTileSpec[] = [
  {
    id: 'damage', label: msg('views-cheats:rules.damage'), name: msg('views-cheats:rules.damage'), sprite: 'hud-master-sword', category: 'combat',
    rungs: [
      { value: 1, label: multiplier(1) }, { value: 2, label: multiplier(2) }, { value: 4, label: multiplier(4) },
      { value: 8, label: multiplier(8) }, { value: 16, label: multiplier(16) }, { value: 248, label: msg('views-cheats:rung.ohko') },
    ],
    read: getDamageMultiplier, write: cheatSetDamageMultiplier,
  },
  {
    id: 'armor', label: msg('views-cheats:rules.armor'), name: msg('views-cheats:rules.armor'), sprite: 'hud-red-mail', category: 'combat',
    rungs: [
      { value: 0, label: msg('views-cheats:rung.full') }, { value: 25, label: reduction(25) }, { value: 50, label: reduction(50) },
      { value: 75, label: reduction(75) }, { value: 100, label: msg('views-cheats:rung.none') },
    ],
    read: getExtraArmorPct, write: cheatSetExtraArmorPct,
  },
];

const ACTION_TILES: ActionTileSpec[] = [
  { id: 'kill', label: msg('views-cheats:rules.kill.label'), name: msg('views-cheats:rules.kill.name'), sprite: 'hud-bombos', category: 'combat', run: cheatKillAllEnemies },
  { id: 'unblock', label: msg('views-cheats:rules.unblock.label'), name: msg('views-cheats:rules.unblock.name'), sprite: 'hud-magic-mirror', category: 'collision', run: cheatUnblockLink },
];

export { ACTION_TILES, RULE_TILES, RUNG_TILES };
