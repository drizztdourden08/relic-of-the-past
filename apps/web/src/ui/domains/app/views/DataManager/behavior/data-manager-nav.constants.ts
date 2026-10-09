/* @layer renderer-app @kind constants */
import { createElement } from 'react';
import { Icon as IconifyIcon } from '@iconify/react/offline';
import homeIcon from '@iconify-icons/lucide/home';
import userIcon from '@iconify-icons/lucide/user';
import gamepadIcon from '@iconify-icons/lucide/gamepad';
import imageIcon from '@iconify-icons/lucide/image';
import personIcon from '@iconify-icons/lucide/person-standing';
import languagesIcon from '@iconify-icons/lucide/languages';
import musicIcon from '@iconify-icons/lucide/music';
import type { SectionNavConfig } from '@ds/composites/SectionNav';

const DATA_MANAGER_NAV: SectionNavConfig = {
  home: { id: 'home', label: 'Home', icon: createElement(IconifyIcon, { icon: homeIcon }) },
  groups: [
    {
      id: 'library',
      label: 'Library',
      items: [
        { id: 'profiles', label: 'Profiles', icon: createElement(IconifyIcon, { icon: userIcon }) },
        { id: 'roms', label: 'ROMs', icon: createElement(IconifyIcon, { icon: gamepadIcon }) },
        { id: 'sprites', label: 'Sprites', icon: createElement(IconifyIcon, { icon: imageIcon }) },
      ],
    },
    {
      id: 'studios',
      label: 'Studios',
      items: [
        { id: 'linkSprites', label: 'Character Studio', icon: createElement(IconifyIcon, { icon: personIcon }) },
        { id: 'languages', label: 'Language Studio', icon: createElement(IconifyIcon, { icon: languagesIcon }) },
        { id: 'msu', label: 'MSU Studio', icon: createElement(IconifyIcon, { icon: musicIcon }) },
      ],
    },
  ],
};

export { DATA_MANAGER_NAV };
