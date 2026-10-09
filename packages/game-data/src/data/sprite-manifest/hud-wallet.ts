/* @layer shared-game @kind data */
import type { SpriteDefinition } from './manifest';

const HUD_WALLET_SPRITE_DEFINITIONS: readonly SpriteDefinition[] = [
  {
    file: 'hud-wallet',
    label: 'Wallet',
    category: 'hud',
    extract: { method: 'art', art: 'wallet' },
  },
];

export { HUD_WALLET_SPRITE_DEFINITIONS };
