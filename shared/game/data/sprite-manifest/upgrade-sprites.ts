/* @layer shared-game @kind data */
import type { SpriteDefinition } from './manifest';

const UPGRADE_SPRITE_DEFINITIONS: readonly SpriteDefinition[] = [
  {
    file: 'upgrade-explosives',
    label: 'Bomb Capacity Upgrade',
    category: 'receipt',
    extract: { method: 'upgrade-composite', baseFile: 'receipt-bomb-3', badge: 'arrow-up' },
  },
  {
    file: 'upgrade-projectiles',
    label: 'Arrow Capacity Upgrade',
    category: 'receipt',
    extract: { method: 'upgrade-composite', baseFile: 'receipt-arrows', badge: 'arrow-up' },
  },
  {
    file: 'upgrade-meter',
    label: 'Magic Capacity Upgrade',
    category: 'receipt',
    extract: { method: 'upgrade-composite', baseFile: 'drop-full-magic', badge: 'arrow-up' },
  },
  {
    file: 'upgrade-wallet',
    label: 'Wallet Capacity Upgrade',
    category: 'receipt',
    extract: { method: 'upgrade-composite', art: 'wallet', badge: 'arrow-up' },
  },
];

export { UPGRADE_SPRITE_DEFINITIONS };
