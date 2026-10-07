/* @layer shared-hud @kind logic */
/**
 * `countdown` is checked the way every other element spec is: one property at
 * a time, refusing instead of guessing. It has one optional field, the pie it
 * draws, and absent means "the profile's own setting" (`hud-countdown.ts`).
 */

import { checkKeys } from './validate-box';
import type { Issues } from './validate-box';
import type { HudCountdownSpec, HudCountdownVariantChoice } from '../../types/hud/hud-countdown';

/** `'setting'` first, then the setting's own two ids, in the order it lists them. */
const COUNTDOWN_VARIANTS: readonly HudCountdownVariantChoice[] = ['setting', 'pixel', 'smooth'];

const isVariantChoice = (value: unknown): value is HudCountdownVariantChoice =>
  typeof value === 'string' && (COUNTDOWN_VARIANTS as readonly string[]).includes(value);

const countdownSpec = (value: Record<string, unknown>, path: string, issues: Issues): HudCountdownSpec | null => {
  checkKeys(value, ['type', 'variant'], path, issues);
  if (value.variant === undefined) return { type: 'countdown' };
  if (!isVariantChoice(value.variant)) {
    issues.push(`${path}.variant: expected one of ${COUNTDOWN_VARIANTS.join(', ')}, got ${JSON.stringify(value.variant)}`);
    return null;
  }
  return { type: 'countdown', variant: value.variant };
};

export { COUNTDOWN_VARIANTS, countdownSpec };
