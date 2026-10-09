/* @layer shared-types @kind types */
import type { GameSettings } from '../../settings';

type HudCountdownVariantId = GameSettings['hudCountdownStyle'];

type HudCountdownVariantChoice = 'setting' | HudCountdownVariantId;

interface HudCountdownSpec {
  type: 'countdown';
  variant?: HudCountdownVariantChoice;
}

export type { HudCountdownSpec, HudCountdownVariantChoice, HudCountdownVariantId };
