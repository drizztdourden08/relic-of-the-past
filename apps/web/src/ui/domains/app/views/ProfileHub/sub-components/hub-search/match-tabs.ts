/* @layer renderer-components @kind logic */
/**
 * What a hub search matches, per tab: how many setting rows (by the same filter
 * the settings pages use, so a count always equals the rows drawn), and the tabs
 * whose own name matches even when no row does (Controls has no rows at all).
 */
import type { GameSettings } from '@shared/types/settings';
import { resolveSections } from '../../../../compounds/SettingsLayout';
import { PROFILE_HUB_TABS } from '../../ProfileHub.constants';
import type { ProfileHubTab } from '../../ProfileHub.type';

interface TabMatches {
  /** Tabs with matching rows, in nav order, with their row count. */
  withRows: { tab: ProfileHubTab; count: number }[];
  /** Tabs whose name matches, for a quick jump. */
  byName: ProfileHubTab[];
  total: number;
}

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
