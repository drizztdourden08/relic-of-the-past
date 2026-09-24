/* @layer renderer-components @kind data */
/**
 * Single registry of every ProfileHub tab: icons, label, and (when the tab is a
 * SettingsLayout screen) the function that builds its Section[] from current settings.
 * A `Record<ProfileHubTab, ...>`. Adding a tab to the union without describing it here is a
 * compile error, which is what keeps this in sync with the hub's nav, its search results and
 * the search palette's catalog with no manual bookkeeping.
 */
import type { IconifyIcon } from '@iconify/react/offline';
import homeIcon from '@iconify-icons/lucide/home';
import monitorIcon from '@iconify-icons/lucide/monitor';
import cameraIcon from '@iconify-icons/lucide/camera';
import windowIcon from '@iconify-icons/lucide/app-window';
import paletteIcon from '@iconify-icons/lucide/palette';
import volumeIcon from '@iconify-icons/lucide/volume-2';
import gamepadIcon from '@iconify-icons/lucide/gamepad-2';
import bugIcon from '@iconify-icons/lucide/bug';
import hudIcon from '@iconify-icons/lucide/layout-dashboard';
import keyboardIcon from '@iconify-icons/lucide/keyboard';
import vibrateIcon from '@iconify-icons/lucide/vibrate';
import wrenchIcon from '@iconify-icons/lucide/wrench';
import phoneIcon from '@iconify-icons/lucide/smartphone';
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
  /** Emoji for the search palette's rows. */
  icon: string;
  /** Line icon for the hub's nav and page headers. */
  navIcon: IconifyIcon;
  label: string;
  /** Omitted for tabs with no SettingsLayout (Home, Controls' custom binding UI). */
  sections?: (settings: GameSettings) => Section[];
  /** Only listed on mobile form factor. */
  mobileOnly?: boolean;
}

// buildPerformanceSection normally takes the live-detected refresh rate + synced-rate status
// (from hooks, not settings). The search catalog only needs the section's labels/keywords for
// indexing, so it's built with a neutral placeholder instead of threading live display state
// through the catalog.
const NEUTRAL_SYNCED_RATE: SyncedRateStatus = {
  supported: true, unsupportedReason: '', availableRates: [], currentHz: null, activeHz: null, bestHz: null, lastError: '',
};

const PROFILE_HUB_TABS: Record<ProfileHubTab, ProfileHubTabSpec> = {
  home: { icon: '🏠', navIcon: homeIcon, label: 'Home' },
  settings: {
    icon: '📺',
    navIcon: monitorIcon,
    label: 'Display',
    sections: (s) => [buildDisplaySection(s), buildPerformanceSection(null, NEUTRAL_SYNCED_RATE)],
  },
  camera: {
    icon: '🎥',
    navIcon: cameraIcon,
    label: 'Camera',
    sections: (s) => {
      const camera = buildCameraSection(s);
      return camera ? [camera] : [];
    },
  },
  window: { icon: '🪟', navIcon: windowIcon, label: 'Window', sections: (s) => [buildWindowSection(s)] },
  graphics: { icon: '🎨', navIcon: paletteIcon, label: 'Graphics', sections: () => [RENDERING_SECTION, ENHANCEMENTS_SECTION, APPEARANCE_SECTION] },
  audio: { icon: '🔊', navIcon: volumeIcon, label: 'Audio', sections: () => AUDIO_SECTIONS },
  gameplay: { icon: '🎮', navIcon: gamepadIcon, label: 'Gameplay', sections: () => GAMEPLAY_SECTIONS },
  bugfixes: { icon: '🐛', navIcon: bugIcon, label: 'Bug Fixes', sections: () => [buildBugFixSection()] },
  hud: { icon: '🖥️', navIcon: hudIcon, label: 'HUD', sections: () => HUD_SECTIONS },
  controls: { icon: '⌨️', navIcon: keyboardIcon, label: 'Controls' },
  haptics: { icon: '📳', navIcon: vibrateIcon, label: 'Haptics', sections: () => HAPTICS_SECTIONS },
  developer: { icon: '🛠️', navIcon: wrenchIcon, label: 'Contributing', sections: () => DEVELOPER_SECTIONS },
  mobile: { icon: '📱', navIcon: phoneIcon, label: 'Mobile', sections: () => [MOBILE_SECTION], mobileOnly: true },
};

/** The nav's groups, in order. Home is not in a group; it is pinned above them. */
const PROFILE_HUB_NAV_GROUPS: { id: string; label: string; tabs: ProfileHubTab[] }[] = [
  { id: 'video', label: 'Video', tabs: ['settings', 'graphics', 'camera', 'window'] },
  { id: 'gameplay', label: 'Gameplay', tabs: ['gameplay', 'audio', 'hud', 'controls'] },
  { id: 'extras', label: 'Extras', tabs: ['bugfixes', 'haptics', 'developer', 'mobile'] },
];

export { PROFILE_HUB_NAV_GROUPS, PROFILE_HUB_TABS };
export type { ProfileHubTabSpec };
