/* @layer renderer-components @kind logic */
import { experimentalFeaturesEnabled, hostDrawnHud } from '@rotp/features';
import { withAspectCascade } from '@app/settings-controls/display/with-aspect-cascade';
import type { AppSettings } from '@app/settings.type';

const withHostDrawnOverlay = (patch: Partial<AppSettings>): Partial<AppSettings> =>
  (patch.hudStyle !== undefined && hostDrawnHud(patch.hudStyle) ? { ...patch, hudMode: 'enhanced', hudEnhancedParts: ['main', 'pause'] } : patch);

const transformSettingsPatch = (patch: Partial<AppSettings>, settings: AppSettings): Partial<AppSettings> => {
  const next = { ...settings, ...patch };
  const gated = { ...patch };
  if (!experimentalFeaturesEnabled(next)) {
    if (next.experimentalFeaturesEnabled) gated.experimentalFeaturesEnabled = false;
    if (next.hudStyle === 'modern') gated.hudStyle = 'enhanced';
    if (next.extraDungeon) gated.extraDungeon = false;
  }
  return withAspectCascade(withHostDrawnOverlay(gated), settings);
};

export { transformSettingsPatch };
