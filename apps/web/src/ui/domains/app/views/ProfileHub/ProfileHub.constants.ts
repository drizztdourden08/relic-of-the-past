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
import type { ProfileHubTab } from './ProfileHub.type';
import { buildDisplaySection, buildCameraSection } from './sub-components/SettingsView.display';
import { buildWindowSection, PERFORMANCE_SECTION, RENDERING_SECTION, ENHANCEMENTS_SECTION, MOBILE_SECTION } from './sub-components/SettingsView.constants';
import { APPEARANCE_SECTION } from './sub-components/graphics-settings-sections';
import { SECTIONS as AUDIO_SECTIONS } from './sub-components/audio-settings-sections';
import { SECTIONS as GAMEPLAY_SECTIONS, SAVE_SECTION } from './sub-components/gameplay-settings-sections';
import { buildBugFixSection } from './sub-components/bugfix-settings-sections';
import { SECTIONS as HUD_SECTIONS } from './sub-components/hud-settings-sections';
import { SECTIONS as HAPTICS_SECTIONS } from './sub-components/haptics-settings-sections';

interface ProfileHubTabSpec {
  icon: string;
  label: string;
  /** Omitted for tabs with no SettingsLayout (Home, Controls' custom binding UI). */
  sections?: (settings: GameSettings) => Section[];
  /** Only appended to the tab list on mobile form factor. */
  mobileOnly?: boolean;
}

const PROFILE_HUB_TABS: Record<ProfileHubTab, ProfileHubTabSpec> = {
  home: { icon: '🏠', label: 'Home' },
  settings: {
    icon: '📺',
    label: 'Display',
    sections: (s) => {
      const camera = buildCameraSection(s);
      return [buildDisplaySection(s), ...(camera ? [camera] : [])];
    },
  },
  graphics: { icon: '🎨', label: 'Graphics', sections: () => [RENDERING_SECTION, ENHANCEMENTS_SECTION, APPEARANCE_SECTION] },
  audio: { icon: '🔊', label: 'Audio', sections: () => AUDIO_SECTIONS },
  gameplay: { icon: '🎮', label: 'Gameplay', sections: () => GAMEPLAY_SECTIONS },
  bugfixes: { icon: '🐛', label: 'Bug Fixes', sections: () => [buildBugFixSection()] },
  hud: { icon: '🖥️', label: 'HUD', sections: () => HUD_SECTIONS },
  controls: { icon: '⌨️', label: 'Controls' },
  haptics: { icon: '📳', label: 'Haptics', sections: () => HAPTICS_SECTIONS },
  system: { icon: '⚙️', label: 'System', sections: (s) => [buildWindowSection(s), PERFORMANCE_SECTION, SAVE_SECTION] },
  mobile: { icon: '📱', label: 'Mobile', sections: () => [MOBILE_SECTION], mobileOnly: true },
};

export { PROFILE_HUB_TABS };
export type { ProfileHubTabSpec };
