/* @layer store-site @kind constants */
import { STORE_RIGHTS } from '@rotp/hub-contracts';
import { SANCTUARY_SITE_URL } from '@rotp/hub-client';
import { StoreRightsEditor } from '@rotp/design';
import type { SiteDefinition } from '@rotp/design';
import { StoreDataProvider } from '../data/StoreDataProvider';
import { StoreSearchResults } from '../search/StoreSearchResults/StoreSearchResults';
import { STORE_VIEW_KEYS } from '../views/store-views';
import { STORE_HOME, STORE_NAV_GROUPS, STORE_SECTIONS } from './site-sections';

const SOURCE_URL = 'https://github.com/drizztdourden08/relic-of-the-past';

const STORE_SITE_UI: SiteDefinition = {
  id: 'store',
  name: 'Hookshop',
  brand: { wordmark: 'Hookshop', homeLabel: 'Hookshop, home' },
  footer: {
    note: 'Made by players for Relic of the Past.',
    links: [
      { id: 'sanctuary', label: 'Sanctuary', href: SANCTUARY_SITE_URL, external: true },
      { id: 'source', label: 'Source', href: SOURCE_URL, external: true },
    ],
  },
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
