/* @layer sanctuary-site @kind constants */
import { SANCTUARY_RIGHTS, STORE_RIGHTS } from '@rotp/hub-contracts';
import { STORE_SITE_URL } from '@rotp/hub-client';
import { StoreRightsEditor } from '@rotp/design';
import type { SiteDefinition } from '@rotp/design';
import { SiteDataProvider } from '../data/SiteDataProvider';
import { SearchResults } from '../search/SearchResults/SearchResults';
import { SANCTUARY_VIEW_KEYS } from '../views/sanctuary-views.constants';
import { SITE_HOME, SITE_NAV_GROUPS, SITE_SECTIONS } from './site-sections.constants';
import { SanctuaryRightsEditor } from './SanctuaryRightsEditor';

const SOURCE_URL = 'https://github.com/drizztdourden08/relic-of-the-past';

const SANCTUARY_SITE_UI: SiteDefinition = {
  id: 'sanctuary',
  name: 'Sanctuary',
  brand: { wordmark: 'Sanctuary', homeLabel: 'Sanctuary, files' },
  footer: {
    note: 'The contributor space for Relic of the Past.',
    links: [
      { id: 'hookshop', label: 'Hookshop', href: STORE_SITE_URL, external: true },
      { id: 'source', label: 'Source', href: SOURCE_URL, external: true },
    ],
  },
  signIn: { lead: 'The contributor space for Relic of the Past.' },
  sections: SITE_SECTIONS,
  home: SITE_HOME,
  navGroups: SITE_NAV_GROUPS,
  search: { placeholder: 'Search files and reports', Results: SearchResults },
  MemberData: SiteDataProvider,
  rightsEditors: [
    { model: SANCTUARY_RIGHTS, Editor: SanctuaryRightsEditor },
    { model: STORE_RIGHTS, Editor: StoreRightsEditor },
  ],
  viewKeys: SANCTUARY_VIEW_KEYS,
};

export { SANCTUARY_SITE_UI };
