/* @layer shared-hud @kind data */
import type { HudCountdownSource, HudVariableDef } from './variables.type';

const HUD_VARIABLES: readonly HudVariableDef[] = [
  { name: 'life_current', note: 'Eighths - one heart is 8. 0 to life_max.' },
  { name: 'life_max', note: 'Capacity, also in eighths. 8-160 (20 containers = 160).' },
  { name: 'magic_current', note: 'Raw magic power. 0-128, a full bar.' },
  { name: 'magic_max', note: 'Constant 128 today; present so a layout never hard-codes it.' },
  { name: 'half_magic', note: '0 or 1 - the upgrade is owned.' },
  { name: 'armor', note: '0-2 - green, blue, red. Drives the heart tint.' },
  { name: 'arrow_current', note: '0 to arrow_max.' },
  { name: 'arrow_max', note: '30-70.' },
  { name: 'bomb_current', note: '0 to bomb_max.' },
  { name: 'bomb_max', note: '10-50.' },
  { name: 'key_current', note: 'Small keys for the current dungeon. 0-99.' },
  { name: 'rupee_current', note: '0 to rupee_max.' },
  { name: 'rupee_max', note: 'Wallet tier: 99, 999 or 9999.' },
  { name: 'silver_arrows', note: '0 or 1.' },
  { name: 'slot_count', note: 'How many slots the active scheme has.' },
  { name: 'countdown_active', note: '0 or 1 - the digging game or a Super Bomb is counting down.' },
  { name: 'countdown_seconds', note: 'Whole seconds left on the countdown. 0 while none runs.' },
  { name: 'countdown_frames', note: 'Frames left inside the current second, 0-61. 0 while none runs.' },
];

const HUD_SCOPE_EXTRAS = ['index', 'count', 'item'] as const;

const IDLE_COUNTDOWN: HudCountdownSource = { active: false, seconds: 0, frames: 0 };

const FULL_MAGIC = 128;

export { FULL_MAGIC, HUD_SCOPE_EXTRAS, HUD_VARIABLES, IDLE_COUNTDOWN };
