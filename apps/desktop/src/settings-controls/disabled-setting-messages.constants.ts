/* @layer renderer-components @kind data */
const DISABLED_SETTING_MESSAGES: Record<string, string> = {
  vanillaSafe: 'Disabled in Vanilla Safe mode',
  randomizer: "Locked by this profile's randomizer",
  cheatsEnabled: 'Cheats are disabled',
  trackerEnabled: 'Tracker is disabled',
  devNavigationData: 'Navigation data is disabled',
  developerTools: 'Needs Developer Tools turned on',
  onlineOnly: 'These options belong to online randomizer profiles. Open a profile that plays an Archipelago room to set them.',
  mobileOnly: 'These options apply to the phone and tablet app only.',
};

export { DISABLED_SETTING_MESSAGES };
