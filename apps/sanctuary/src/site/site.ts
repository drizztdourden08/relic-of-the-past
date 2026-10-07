/* @layer sanctuary-site @kind logic */
/**
 * The Sanctuary as the site kit sees it: its brand, words, sections, search, shared data and
 * rights editors. Its admin page manages the groups of both sites, so the Hookshop's rights
 * editor sits beside its own.
 */
import { SANCTUARY_RIGHTS } from '@shared/sanctuary/sanctuary-rights';
import { STORE_RIGHTS } from '@shared/store/store-rights';
import type { SiteDefinition } from '@site-kit/site/site-definition.type';
import { SiteDataProvider } from '../data/SiteDataProvider';
import { SearchResults } from '../search/SearchResults/SearchResults';
import { SANCTUARY_VIEW_KEYS } from '../views/sanctuary-views';
import { SITE_HOME, SITE_NAV_GROUPS, SITE_SECTIONS } from './site-sections';
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
