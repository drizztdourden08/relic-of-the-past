/* @layer store-site @kind constants */
/**
 * The store's sections: one entry per page the nav reaches, with the path it opens and the
 * line icon it wears. Home is pinned; Browse, the three kinds, the player's own pages and
 * the Reviewer group (the Reviewer Hub and Administration) sit in groups. A section's path must not start another's, since the
 * active section is the first whose path the location starts with.
 */
import homeIcon from '@iconify-icons/lucide/home';
import gridIcon from '@iconify-icons/lucide/layout-grid';
import packageIcon from '@iconify-icons/lucide/package';
import userIcon from '@iconify-icons/lucide/user';
import reviewIcon from '@iconify-icons/lucide/clipboard-check';
import settingsIcon from '@iconify-icons/lucide/settings';
import type { StorePermission } from '@shared/store/store-permissions';
import type { SiteNavGroup, SiteSection } from '@site-kit/site/site-definition.type';
import { KIND_ICONS, KIND_PLURALS, KIND_SECTIONS } from '../lib/kinds';

const REVIEW_PERMISSION: StorePermission = 'review';
const FEATURE_PERMISSION: StorePermission = 'feature';

type StoreSectionId =
  | 'home' | 'browse' | 'music' | 'characters' | 'languages' | 'publications' | 'account' | 'review' | 'admin';

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

/** The groups under the pinned home, in order. */
const STORE_NAV_GROUPS: SiteNavGroup[] = [
  { id: 'store', label: 'Hookshop', sections: ['browse'] },
  { id: 'kinds', label: 'Kinds', sections: ['music', 'characters', 'languages'] },
  { id: 'you', label: 'You', sections: ['publications', 'account'] },
  { id: 'review', label: 'Reviewer', sections: ['review', 'admin'] },
];

export { STORE_SECTIONS, STORE_HOME, STORE_NAV_GROUPS, REVIEW_PERMISSION, FEATURE_PERMISSION };
export type { StoreSectionId };
