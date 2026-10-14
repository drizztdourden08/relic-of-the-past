/* @layer renderer-components @kind logic */
import { hostDrawnHud } from '@rotp/features';
import { withAspectCascade } from '@app/settings-controls/display/with-aspect-cascade';
import type { AppSettings } from '@app/settings.type';

const withHostDrawnOverlay = (patch: Partial<AppSettings>): Partial<AppSettings> =>
  (patch.hudStyle !== undefined && hostDrawnHud(patch.hudStyle) ? { ...patch, hudMode: 'enhanced', hudEnhancedParts: ['main', 'pause'] } : patch);

const transformSettingsPatch = (patch: Partial<AppSettings>, settings: AppSettings): Partial<AppSettings> =>
  withAspectCascade(withHostDrawnOverlay(patch), settings);

export { transformSettingsPatch };
