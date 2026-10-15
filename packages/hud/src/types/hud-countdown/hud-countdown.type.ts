/* @layer shared-types @kind types */
import type { GameSettings } from '@rotp/features';

type HudCountdownVariantId = GameSettings['hudCountdownStyle'];

type HudCountdownVariantChoice = 'setting' | HudCountdownVariantId;

interface HudCountdownSpec {
  type: 'countdown';
  variant?: HudCountdownVariantChoice;
}

export type { HudCountdownSpec, HudCountdownVariantChoice };
