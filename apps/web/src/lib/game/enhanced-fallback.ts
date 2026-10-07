/* @layer bridge-wasm @kind logic */
/**
 * The app-drawn HUD styles (Enhanced and Modern) need a 16:9-or-wider display, and
 * there are two ways to stop having one: narrow the ratio in settings, or narrow
 * the window itself.
 *
 * The settings screen owns the correction either way, because it is the only
 * place that holds the profile's settings and the toast queue. So both routes ask
 * for the same thing through this one event instead of each dropping the style and
 * raising a message of its own. One rule, one wording, one toast id, so a player
 * who trips it twice sees the notice replaced and not stacked.
 */
const ENHANCED_FALLBACK_EVENT = 'hud:enhanced-fallback';

const ENHANCED_FALLBACK_TOAST_ID = 'enhanced-needs-wide';

const ENHANCED_FALLBACK_MESSAGE =
  'The Enhanced and Modern HUD styles need a 16:9 or wider display, so the style is back to Original';

/** Ask the settings owner to drop back to the Original style and say why. */
const requestEnhancedFallback = (): void => {
  window.dispatchEvent(new Event(ENHANCED_FALLBACK_EVENT));
};

export {
  ENHANCED_FALLBACK_EVENT,
  ENHANCED_FALLBACK_MESSAGE,
  ENHANCED_FALLBACK_TOAST_ID,
  requestEnhancedFallback,
};
