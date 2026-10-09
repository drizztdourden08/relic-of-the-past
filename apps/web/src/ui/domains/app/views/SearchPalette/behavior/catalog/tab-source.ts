/* @layer renderer-components @kind logic */
import { isHubTabShown, PROFILE_HUB_TABS } from '../../../ProfileHub/ProfileHub.constants';
import type { ProfileHubTab } from '../../../ProfileHub/ProfileHub.type';
import type { SearchContext, SearchEntry, SearchSource } from '../../SearchPalette.type';

const build = (ctx: SearchContext): SearchEntry[] => {
  if (!ctx.settings) return [];

  return (Object.entries(PROFILE_HUB_TABS) as [ProfileHubTab, typeof PROFILE_HUB_TABS[ProfileHubTab]][])
    .filter(([tab, spec]) => tab !== 'home' && isHubTabShown(spec, { isMobile: ctx.isMobile, isOnline: ctx.isOnline === true }))
    .map(([tab, spec]): SearchEntry => ({
      id: `tab:${tab}`,
      kind: 'tab',
      label: spec.label,
      icon: spec.icon,
      breadcrumb: ['Home'],
      keywords: spec.label,
      target: { page: 'profile', tab },
    }));
};

const tabSource: SearchSource = { id: 'tab', build };

export { tabSource };
