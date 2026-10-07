/* @layer store-site @kind logic */
/** The Hookshop as the site kit sees it: its brand, words, sections, search, shared data and rights editor. */
import { STORE_RIGHTS } from '@shared/store/store-rights';
import type { SiteDefinition } from '@site-kit/site/site-definition.type';
import { StoreDataProvider } from '../data/StoreDataProvider';
import { StoreSearchResults } from '../search/StoreSearchResults/StoreSearchResults';
import { STORE_VIEW_KEYS } from '../views/store-views';
import { STORE_HOME, STORE_NAV_GROUPS, STORE_SECTIONS } from './site-sections';
import { StoreRightsEditor } from './StoreRightsEditor';

const STORE_SITE_UI: SiteDefinition = {
  id: 'store',
  name: 'Hookshop',
  brand: { wordmark: 'Hookshop', logo: '/logo-128.png', homeLabel: 'Hookshop, home' },
  signIn: { lead: 'Music packs, characters and languages made by players.' },
  sections: STORE_SECTIONS,
  home: STORE_HOME,
  navGroups: STORE_NAV_GROUPS,
  search: { placeholder: 'Search the Hookshop', Results: StoreSearchResults },
  MemberData: StoreDataProvider,
  rightsEditors: [{ model: STORE_RIGHTS, Editor: StoreRightsEditor }],
  viewKeys: STORE_VIEW_KEYS,
};

export { STORE_SITE_UI };
