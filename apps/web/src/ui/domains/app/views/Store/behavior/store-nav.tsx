/* @layer renderer-app @kind data */
/** The Hookshop's side nav: Home pinned on top, the catalogue, then what this computer has. */
import { Icon as IconifyIcon } from '@iconify/react/offline';
import homeIcon from '@iconify-icons/lucide/home';
import gridIcon from '@iconify-icons/lucide/layout-grid';
import packageCheckIcon from '@iconify-icons/lucide/package-check';
import updateIcon from '@iconify-icons/lucide/refresh-cw';
import type { SectionNavConfig } from '@ds/composites/SectionNav';
import { KIND_ICONS } from '../../../compounds/StoreItemCard';

const STORE_NAV: SectionNavConfig = {
  home: { id: 'home', label: 'Home', icon: <IconifyIcon icon={homeIcon} /> },
  groups: [
    {
      id: 'catalogue',
      label: 'Catalogue',
      items: [
        { id: 'browse', label: 'Browse', icon: <IconifyIcon icon={gridIcon} /> },
        { id: 'music', label: 'Music packs', icon: <IconifyIcon icon={KIND_ICONS.music} /> },
        { id: 'character', label: 'Characters', icon: <IconifyIcon icon={KIND_ICONS.character} /> },
        { id: 'language', label: 'Languages', icon: <IconifyIcon icon={KIND_ICONS.language} /> },
      ],
    },
    {
      id: 'mine',
      label: 'On this computer',
      items: [
        { id: 'installed', label: 'Installed', icon: <IconifyIcon icon={packageCheckIcon} /> },
        { id: 'updates', label: 'Updates', icon: <IconifyIcon icon={updateIcon} /> },
      ],
    },
  ],
};

export { STORE_NAV };
