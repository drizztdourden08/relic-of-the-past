/* @layer shared-types @kind types */
/**
 * `countdown` is the HUD timer the digging game and the Super Bomb share: a pie
 * that loses a slice per share of the time, with the seconds drawn on it. The
 * renderer reuses the `HudCountdown` compound the Original style already draws
 * (`HudView`'s `HudCountdownSlot`); this leaf only says WHERE it goes (§62).
 *
 * IT DRAWS ONLY WHILE THE GAME COUNTS DOWN. While `countdown_active` reads 0 the
 * node is not visible, exactly as `visible: false` is, so it leaves the flow and
 * takes no space (`resolve-box.ts::resolveVisible`). That is the kind's own rule,
 * not something an author has to remember to bind.
 *
 * `variant` picks the pie. Absent, or `'setting'`, follows the profile's own
 * `hudCountdownStyle`; one of the setting's own ids pins this node to that pie.
 */

import type { GameSettings } from '../settings';

/** The pies the setting offers, named exactly as the setting names them. */
type HudCountdownVariantId = GameSettings['hudCountdownStyle'];

/** What a node may ask for: the profile's choice, or one pie outright. */
type HudCountdownVariantChoice = 'setting' | HudCountdownVariantId;

interface HudCountdownSpec {
  type: 'countdown';
  variant?: HudCountdownVariantChoice;
}

export type { HudCountdownSpec, HudCountdownVariantChoice, HudCountdownVariantId };
