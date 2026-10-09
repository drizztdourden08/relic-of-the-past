/* @layer renderer-components @kind constants */
import type { HudCountdownVariantChoice } from '@shared/types/hud';

const PIE_OPTIONS: { value: HudCountdownVariantChoice; label: string; title: string }[] = [
  { value: 'setting', label: 'profile', title: 'Follow the Countdown Timer setting' },
  { value: 'pixel', label: 'pixel', title: 'Always the pixel pie' },
  { value: 'smooth', label: 'smooth', title: 'Always the smooth pie' },
];

export { PIE_OPTIONS };
