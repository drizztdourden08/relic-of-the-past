/* @layer renderer-components @kind constants */
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
import joystickIcon from '@iconify-icons/lucide/joystick';
import globeIcon from '@iconify-icons/lucide/globe';
import type { SyncedRateStatus } from '@shared/types/display';
import type { ProfileHubNavGroup, ProfileHubTab, ProfileHubTabSpec } from './ProfileHub.type';
import { buildDisplaySection } from './sub-components/SettingsView.display';
import { buildCameraSection } from './sub-components/build-camera-section';
import { buildWindowSection } from './sub-components/build-window-section';
import { buildPerformanceSection } from './sub-components/build-performance-section';
import { RENDERING_SECTION, ENHANCEMENTS_SECTION, MOBILE_SECTION } from './sub-components/SettingsView.constants';
import { APPEARANCE_SECTION } from './sub-components/graphics-settings-sections.constants';
import { SECTIONS as AUDIO_SECTIONS } from './sub-components/audio-settings-sections.constants';
import { SECTIONS as GAMEPLAY_SECTIONS } from './sub-components/gameplay-settings-sections.constants';
import { buildBugFixSection } from './sub-components/build-bug-fix-section';
import { SECTIONS as HUD_SECTIONS } from './sub-components/hud-settings-sections.constants';
import { SECTIONS as HAPTICS_SECTIONS } from './sub-components/haptics-settings-sections.constants';
import { SECTIONS as DEVELOPER_SECTIONS } from './sub-components/developer-settings-sections.constants';
import { SECTIONS as ONLINE_SECTIONS } from './sub-components/online-settings-sections.constants';

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
  online: { icon: '🌐', navIcon: globeIcon, label: 'Online', sections: () => ONLINE_SECTIONS, onlineOnly: true },
  developer: { icon: '🛠️', navIcon: wrenchIcon, label: 'Contributing', sections: () => DEVELOPER_SECTIONS },
  gba: { icon: '🕹️', navIcon: joystickIcon, label: 'Game Boy Advance' },
  mobile: { icon: '📱', navIcon: phoneIcon, label: 'Mobile', sections: () => [MOBILE_SECTION], mobileOnly: true },
};

const PROFILE_HUB_NAV_GROUPS: ProfileHubNavGroup[] = [
  { id: 'video', label: 'Video', tabs: ['settings', 'graphics', 'camera', 'window'] },
  { id: 'gameplay', label: 'Gameplay', tabs: ['gameplay', 'audio', 'hud', 'controls'] },
  { id: 'extras', label: 'Extras', tabs: ['bugfixes', 'haptics', 'online', 'developer', 'gba', 'mobile'] },
];

export { PROFILE_HUB_NAV_GROUPS, PROFILE_HUB_TABS };
export { isHubTabShown } from './behavior/is-hub-tab-shown';
export type { ProfileHubTabSpec, TabShownContext } from './ProfileHub.type';
