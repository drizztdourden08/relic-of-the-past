/* @layer renderer-app @kind constants */
import type { MenuEntry } from '@drizztdourden08/brock-react';

const GAME_ENTRY: MenuEntry = { key: 'settings', label: 'Game', icon: 'gamepad-2', screen: 'settings' };

const PROFILES_ENTRY: MenuEntry = { key: 'profiles', label: 'Profiles', icon: 'users', screen: 'data/profiles' };

const ABOUT_ENTRY: MenuEntry = { key: 'about', label: 'About', icon: 'info', screen: 'about' };

const NO_ENTRIES: readonly MenuEntry[] = [];

const MOBILE_TITLE = 'Relic of the Past';

const MOBILE_LOGO = './logos/logo/logo-512.png';

export { ABOUT_ENTRY, GAME_ENTRY, MOBILE_LOGO, MOBILE_TITLE, NO_ENTRIES, PROFILES_ENTRY };
