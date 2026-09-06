/* @layer renderer-components @kind logic */
/**
 * One entry per ProfileHub tab (Display, Graphics, Controls, ...), so searching "haptics" or
 * "controls" jumps straight to the tab even when it has no individual settings of its own
 * (Controls) or the query doesn't match any one setting's label. Derived from the same
 * PROFILE_HUB_TABS registry as the NavRail and settings-source, so a new tab is indexed for
 * free. 'home' is skipped: it's already the menu's "Home" screen entry.
 */
import { PROFILE_HUB_TABS } from '../../../ProfileHub/ProfileHub.constants';
import type { ProfileHubTab } from '../../../ProfileHub/ProfileHub.type';
import type { SearchContext, SearchEntry, SearchSource } from '../../SearchPalette.type';

const build = (ctx: SearchContext): SearchEntry[] => {
  // ProfileHub only renders with an active profile. Without one, 'tab:*' would target a
  // page that shows nothing.
  if (!ctx.settings) return [];

  return (Object.entries(PROFILE_HUB_TABS) as [ProfileHubTab, typeof PROFILE_HUB_TABS[ProfileHubTab]][])
    .filter(([tab, spec]) => tab !== 'home' && (!spec.mobileOnly || ctx.isMobile))
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
