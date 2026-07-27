/* @layer renderer-components @kind data */
/**
 * Single registry of every ProfileHub tab: icon, label, and (when the tab is a
 * SettingsLayout screen) the function that builds its Section[] from current settings.
 * A `Record<ProfileHubTab, …>` — adding a tab to the union without describing it here is a
 * compile error, which is what keeps this in sync with ProfileHubBody's NavRail and the
 * search catalog's settings-source with no manual bookkeeping.
 */
import type { GameSettings } from '@shared/types/settings';
import type { Section } from '../../compounds/SettingsLayout';
import type { SyncedRateStatus } from '@shared/types/display';
import type { ProfileHubTab } from './ProfileHub.type';
import { buildDisplaySection, buildCameraSection } from './sub-components/SettingsView.display';
import { buildWindowSection, buildPerformanceSection, RENDERING_SECTION, ENHANCEMENTS_SECTION, MOBILE_SECTION } from './sub-components/SettingsView.constants';
import { APPEARANCE_SECTION } from './sub-components/graphics-settings-sections';
import { SECTIONS as AUDIO_SECTIONS } from './sub-components/audio-settings-sections';
import { SECTIONS as GAMEPLAY_SECTIONS } from './sub-components/gameplay-settings-sections';
import { buildBugFixSection } from './sub-components/bugfix-settings-sections';
import { SECTIONS as HUD_SECTIONS } from './sub-components/hud-settings-sections';
import { SECTIONS as HAPTICS_SECTIONS } from './sub-components/haptics-settings-sections';
import { SECTIONS as DEVELOPER_SECTIONS } from './sub-components/developer-settings-sections';

interface ProfileHubTabSpec {
  icon: string;
  label: string;
  /** Omitted for tabs with no SettingsLayout (Home, Controls' custom binding UI). */
  sections?: (settings: GameSettings) => Section[];
  /** Only appended to the tab list on mobile form factor. */
  mobileOnly?: boolean;
}

// buildPerformanceSection normally takes the live-detected refresh rate + synced-rate status
// (from hooks, not settings). The search catalog only needs the section's labels/keywords for
// indexing, so it's built with a neutral placeholder rather than threading live display state
// through the catalog.
const NEUTRAL_SYNCED_RATE: SyncedRateStatus = {
  supported: true, unsupportedReason: '', availableRates: [], currentHz: null, activeHz: null, bestHz: null, lastError: '',
};

const PROFILE_HUB_TABS: Record<ProfileHubTab, ProfileHubTabSpec> = {
  home: { icon: '🏠', label: 'Home' },
  settings: {
    icon: '📺',
    label: 'Display',
    sections: (s) => {
      const camera = buildCameraSection(s);
      return [
        buildDisplaySection(s),
        ...(camera ? [camera] : []),
        buildWindowSection(s),
        buildPerformanceSection(null, NEUTRAL_SYNCED_RATE),
      ];
    },
  },
  graphics: { icon: '🎨', label: 'Graphics', sections: () => [RENDERING_SECTION, ENHANCEMENTS_SECTION, APPEARANCE_SECTION] },
  audio: { icon: '🔊', label: 'Audio', sections: () => AUDIO_SECTIONS },
  gameplay: { icon: '🎮', label: 'Gameplay', sections: () => GAMEPLAY_SECTIONS },
  bugfixes: { icon: '🐛', label: 'Bug Fixes', sections: () => [buildBugFixSection()] },
  hud: { icon: '🖥️', label: 'HUD', sections: () => HUD_SECTIONS },
  controls: { icon: '⌨️', label: 'Controls' },
  haptics: { icon: '📳', label: 'Haptics', sections: () => HAPTICS_SECTIONS },
  developer: { icon: '🛠️', label: 'Developer', sections: () => DEVELOPER_SECTIONS },
  mobile: { icon: '📱', label: 'Mobile', sections: () => [MOBILE_SECTION], mobileOnly: true },
};

export { PROFILE_HUB_TABS };
export type { ProfileHubTabSpec };
