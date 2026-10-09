/* @layer shared-hud @kind logic */
import { checkKeys } from './validate-box';
import { COUNTDOWN_VARIANTS } from './validate-countdown-node.constants';
import type { Issues } from './validate-box';
import type { HudCountdownSpec, HudCountdownVariantChoice } from '../types/hud-countdown';

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

export { countdownSpec };
