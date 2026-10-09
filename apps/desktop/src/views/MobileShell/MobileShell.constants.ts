/* @layer renderer-app @kind constants */
import type { MenuEntry } from '@drizztdourden08/brock-react';

const MOBILE_EXTRA_ENTRIES: MenuEntry[] = [
  { key: 'profiles', label: 'Profiles', screen: 'profiles' },
  { key: 'about', label: 'About', screen: 'about' },
];

const MOBILE_TITLE = 'Relic of the Past';

const MOBILE_LOGO = './logos/logo/logo-512.png';

export { MOBILE_EXTRA_ENTRIES, MOBILE_LOGO, MOBILE_TITLE };
