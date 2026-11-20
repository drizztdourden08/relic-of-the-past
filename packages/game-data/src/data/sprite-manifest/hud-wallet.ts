/* @layer shared-game @kind data */
import { msg } from '@drizztdourden08/brock-core/i18n';
import type { SpriteDefinition } from './manifest';

const HUD_WALLET_SPRITE_DEFINITIONS: readonly SpriteDefinition[] = [
  {
    file: 'hud-wallet',
    label: msg('game-labels:sprite.wallet'),
    category: 'hud',
    extract: { method: 'art', art: 'wallet' },
  },
];

export { HUD_WALLET_SPRITE_DEFINITIONS };
