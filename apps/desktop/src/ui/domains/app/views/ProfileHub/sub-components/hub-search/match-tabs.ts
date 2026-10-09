/* @layer renderer-components @kind logic */
import type { GameSettings } from '@shared/types/settings';
import { resolveSections } from '../../../../compounds/SettingsLayout';
import { PROFILE_HUB_TABS } from '../../ProfileHub.constants';
import type { ProfileHubTab } from '../../ProfileHub.type';
import type { TabMatches } from './hub-search.type';

const matchTabs = (tabs: readonly ProfileHubTab[], settings: GameSettings, query: string): TabMatches => {
  const withRows = tabs.flatMap((tab) => {
    const sections = PROFILE_HUB_TABS[tab].sections?.(settings) ?? [];
    const count = resolveSections(sections, query)
      .reduce((sum, section) => sum + section.groups.reduce((n, group) => n + group.items.length, 0), 0);
    return count > 0 ? [{ tab, count }] : [];
  });
  const byName = tabs.filter((tab) => PROFILE_HUB_TABS[tab].label.toLowerCase().includes(query));
  return { withRows, byName, total: withRows.reduce((sum, m) => sum + m.count, 0) };
};

export { matchTabs };
export type { TabMatches };
