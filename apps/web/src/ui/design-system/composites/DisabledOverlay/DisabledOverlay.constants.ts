/* @layer renderer-components @kind data */
/**
 * Overlay copy per gating setting id. A caller that can be locked for more than one reason
 * (a widget's Vanilla Safe lock vs. its own `requiresSetting` gate) looks up the message here
 * instead of hardcoding strings at each call site — adding a new gated setting only needs an
 * entry here to get a real message everywhere it's covered.
 */
const DISABLED_SETTING_MESSAGES: Record<string, string> = {
  vanillaSafe: 'Disabled in Vanilla Safe mode',
  cheatsEnabled: 'Cheats are disabled',
  trackerEnabled: 'Tracker is disabled',
  devNavigationData: 'Navigation data is disabled',
};

export { DISABLED_SETTING_MESSAGES };
