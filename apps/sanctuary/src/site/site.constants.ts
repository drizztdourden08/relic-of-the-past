/* @layer sanctuary-site @kind constants */
import { SANCTUARY_RIGHTS } from '@rotp/hub-contracts';
import { STORE_RIGHTS } from '@rotp/hub-contracts';
import type { SiteDefinition } from '@rotp/design';
import { SiteDataProvider } from '../data/SiteDataProvider';
import { SearchResults } from '../search/SearchResults/SearchResults';
import { SANCTUARY_VIEW_KEYS } from '../views/sanctuary-views.constants';
import { SITE_HOME, SITE_NAV_GROUPS, SITE_SECTIONS } from './site-sections.constants';
import { SanctuaryRightsEditor } from './SanctuaryRightsEditor';
import { StoreRightsEditor } from '../../../store/src/site/StoreRightsEditor';

const SANCTUARY_SITE_UI: SiteDefinition = {
  id: 'sanctuary',
  name: 'Sanctuary',
  brand: { wordmark: 'Sanctuary', logo: '/logo-128.png', homeLabel: 'Sanctuary, files' },
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
