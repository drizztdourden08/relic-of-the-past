/* @layer shared-features @kind logic */
/**
 * THE HUD STYLE IS THE ONE CHOICE. Everything the control scheme used to be
 * asked separately is derived from it here, in one place.
 *
 * Three styles, and the two questions worth asking about them:
 *
 *  - `vanilla` is the game's own HUD, drawn by the core.
 *  - `enhanced` has the app draw the HUD and own the pause menu.
 *  - `modern` is everything Enhanced does, plus the modern control scheme.
 *
 * The values ARE the words on screen (§59.7). `enhanced` was stored and written
 * as `extended` until the label was corrected, which left the code and the
 * settings screen naming the same style two different things. That is the one kind of
 * drift that makes a reader trust the wrong one. `mergeSettings` migrates the
 * old spelling on every read and is the only place allowed to know about it.
 *
 * `hostDrawnHud` is the "does the app draw this?" question. That term was
 * once written out as a comparison against the one style at nine call sites,
 * each of which had to be found again the day a third style appeared.
 * `controlSchemeOf` is the whole of what `GameSettings.controlScheme` used to
 * store: the scheme is no longer a setting the player picks, it is what the
 * Modern style MEANS.
 */
import type { ControlSchemeId } from '../input/scheme';
import type { GameSettings } from '../types/settings';

type HudStyle = GameSettings['hudStyle'];

/** True while the app draws the HUD and owns the pause menu, which is every style but Original. */
const hostDrawnHud = (style: HudStyle): boolean => style !== 'vanilla';

/** The scheme is DERIVED, never stored: modern controls ⇔ the Modern HUD style. */
const controlSchemeOf = (settings: Pick<GameSettings, 'hudStyle'>): ControlSchemeId =>
  settings.hudStyle === 'modern' ? 'modern' : 'classic';

export { controlSchemeOf, hostDrawnHud };
export type { HudStyle };
