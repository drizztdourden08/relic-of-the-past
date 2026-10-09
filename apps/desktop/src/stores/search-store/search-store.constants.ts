/* @layer renderer-stores @kind constants */
const SETTINGS_TARGETS: Record<string, { tab: string; anchor: string }> = {
  vanillaSafe: { tab: 'gameplay', anchor: 'vanillaSafe' },
  cheatsEnabled: { tab: 'gameplay', anchor: 'cheatsEnabled' },
  hudStyle: { tab: 'hud', anchor: 'hudStyle' },
};

export { SETTINGS_TARGETS };
