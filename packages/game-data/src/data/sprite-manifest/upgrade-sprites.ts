/* @layer shared-game @kind data */
import type { SpriteDefinition } from './manifest';

const UPGRADE_SPRITE_DEFINITIONS: readonly SpriteDefinition[] = [
  {
    file: 'upgrade-explosives',
    label: { key: 'game-labels:sprite.bombUpgrade' },
    category: 'receipt',
    extract: { method: 'upgrade-composite', baseFile: 'receipt-bomb-3', badge: 'arrow-up' },
  },
  {
    file: 'upgrade-projectiles',
    label: { key: 'game-labels:sprite.arrowUpgrade' },
    category: 'receipt',
    extract: { method: 'upgrade-composite', baseFile: 'receipt-arrows', badge: 'arrow-up' },
  },
  {
    file: 'upgrade-meter',
    label: { key: 'game-labels:sprite.magicUpgrade' },
    category: 'receipt',
    extract: { method: 'upgrade-composite', baseFile: 'drop-full-magic', badge: 'arrow-up' },
  },
  {
    file: 'upgrade-wallet',
    label: { key: 'game-labels:sprite.walletUpgrade' },
    category: 'receipt',
    extract: { method: 'upgrade-composite', art: 'wallet', badge: 'arrow-up' },
  },
];

export { UPGRADE_SPRITE_DEFINITIONS };
