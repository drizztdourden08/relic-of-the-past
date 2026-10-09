/* @layer store-site @kind constants */
import homeIcon from '@iconify-icons/lucide/home';
import gridIcon from '@iconify-icons/lucide/layout-grid';
import packageIcon from '@iconify-icons/lucide/package';
import userIcon from '@iconify-icons/lucide/user';
import reviewIcon from '@iconify-icons/lucide/clipboard-check';
import settingsIcon from '@iconify-icons/lucide/settings';
import type { StorePermission } from '@rotp/hub-contracts';
import type { SiteNavGroup, SiteSection } from '@rotp/design';
import { KIND_ICONS, KIND_PLURALS, KIND_SECTIONS } from '../../lib/kinds';
import type { StoreSectionId } from './site-sections.type';

const REVIEW_PERMISSION: StorePermission = 'review';
const FEATURE_PERMISSION: StorePermission = 'feature';

const STORE_SECTIONS: Record<StoreSectionId, SiteSection> = {
  home: { id: 'home', label: 'Home', path: '/home', icon: homeIcon },
  browse: { id: 'browse', label: 'Browse', path: '/browse', icon: gridIcon },
  music: { id: 'music', label: KIND_PLURALS.music, path: `/${KIND_SECTIONS.music}`, icon: KIND_ICONS.music },
  characters: { id: 'characters', label: KIND_PLURALS.character, path: `/${KIND_SECTIONS.character}`, icon: KIND_ICONS.character },
  languages: { id: 'languages', label: KIND_PLURALS.language, path: `/${KIND_SECTIONS.language}`, icon: KIND_ICONS.language },
  publications: { id: 'publications', label: 'My publications', path: '/publications', icon: packageIcon },
  account: { id: 'account', label: 'Account', path: '/account', icon: userIcon },
  review: { id: 'review', label: 'Reviewer Hub', path: '/review', icon: reviewIcon, permission: REVIEW_PERMISSION },
  admin: { id: 'admin', label: 'Administration', path: '/admin', icon: settingsIcon, permission: FEATURE_PERMISSION },
};

const STORE_HOME: StoreSectionId = 'home';

const STORE_NAV_GROUPS: SiteNavGroup[] = [
  { id: 'store', label: 'Hookshop', sections: ['browse'] },
  { id: 'kinds', label: 'Kinds', sections: ['music', 'characters', 'languages'] },
  { id: 'you', label: 'You', sections: ['publications', 'account'] },
  { id: 'review', label: 'Reviewer', sections: ['review', 'admin'] },
];

export { STORE_SECTIONS, STORE_HOME, STORE_NAV_GROUPS, REVIEW_PERMISSION, FEATURE_PERMISSION };
