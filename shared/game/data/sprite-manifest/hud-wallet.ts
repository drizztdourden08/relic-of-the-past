/* @layer shared-game @kind data */
/**
 * The wallet picture the enhanced HUD draws beside the rupee counter.
 *
 * The game has no wallet sprite to cut because the counter is a bare number, so this
 * one is our own 16x16 pixel-art drawing, rendered by the `art` extraction
 * method straight from the art library. Plain art, no badge: the capacity
 * variants (the same drawing with an upgrade badge stamped on it) belong to the
 * randomizer feature and are defined on its own branch.
 */
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
