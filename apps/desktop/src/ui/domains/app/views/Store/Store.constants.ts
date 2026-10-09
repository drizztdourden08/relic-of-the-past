/* @layer renderer-components @kind constants */
import { createElement } from 'react';
import { Icon as IconifyIcon } from '@iconify/react/offline';
import homeIcon from '@iconify-icons/lucide/home';
import gridIcon from '@iconify-icons/lucide/layout-grid';
import packageCheckIcon from '@iconify-icons/lucide/package-check';
import updateIcon from '@iconify-icons/lucide/refresh-cw';
import type { SideNavConfig } from '@drizztdourden08/tessera/composites';
import { STORE_SITE_HOST } from '@app/lib/store/store-site';
import { KIND_ICONS } from '../../compounds/StoreItemCard';
import type { HubAccountCopy } from '../../compounds/HubAccountCard';
import type { CatalogState, InstallJob, StoreSection } from './Store.type';

const STORE_NAV: SideNavConfig = {
  home: { id: 'home', label: 'Home', icon: createElement(IconifyIcon, { icon: homeIcon }) },
  groups: [
    {
      id: 'catalogue',
      label: 'Catalogue',
      items: [
        { id: 'browse', label: 'Browse', icon: createElement(IconifyIcon, { icon: gridIcon }) },
        { id: 'music', label: 'Music packs', icon: createElement(IconifyIcon, { icon: KIND_ICONS.music }) },
        { id: 'character', label: 'Characters', icon: createElement(IconifyIcon, { icon: KIND_ICONS.character }) },
        { id: 'language', label: 'Languages', icon: createElement(IconifyIcon, { icon: KIND_ICONS.language }) },
      ],
    },
    {
      id: 'mine',
      label: 'On this computer',
      items: [
        { id: 'installed', label: 'Installed', icon: createElement(IconifyIcon, { icon: packageCheckIcon }) },
        { id: 'updates', label: 'Updates', icon: createElement(IconifyIcon, { icon: updateIcon }) },
      ],
    },
  ],
};

const EMPTY_CATALOG: CatalogState = { home: null, items: [], loading: false, error: null };

const IDLE_JOB: InstallJob = { running: false, progress: null, error: null };

const STORE_SECTIONS: readonly StoreSection[] = ['home', 'browse', 'music', 'character', 'language', 'installed', 'updates'];

const GRID_SECTIONS: readonly StoreSection[] = ['browse', 'music', 'character', 'language'];

const GRID_TITLES: Partial<Record<StoreSection, string>> = {
  browse: 'Browse',
  music: 'Music packs',
  character: 'Characters',
  language: 'Languages',
};

const HIGHLIGHT_PIXEL = 3;

const BAR_MAX = 1000;

const STORE_COPY: HubAccountCopy = {
  signedOutLead: '',
  signInLabel: 'Sign in',
  openSiteLabel: 'Open on the site',
  siteHost: STORE_SITE_HOST,
};

const SIGN_IN_LEAD = 'Browsing and installing packs needs a Relic of the Past account. It is the same account as the Sanctuary; publishing, ratings and your profile are on the site.';
const WAITING_LINK = 'Sign in to install the pack you picked on the site. The install starts as soon as you are signed in.';

export {
  BAR_MAX,
  EMPTY_CATALOG,
  GRID_SECTIONS,
  GRID_TITLES,
  HIGHLIGHT_PIXEL,
  IDLE_JOB,
  SIGN_IN_LEAD,
  STORE_COPY,
  STORE_NAV,
  STORE_SECTIONS,
  WAITING_LINK,
};
