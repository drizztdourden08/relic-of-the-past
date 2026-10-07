/* @layer renderer-components @kind component */
/**
 * The hub's search pane: every setting matching the query, from every tab,
 * with its real control. Each tab draws its own rows in results mode (see
 * SettingsPageContext), grouped under the tab's name with a way to open it.
 */
import { useMemo } from 'react';
import { Icon as IconifyIcon } from '@iconify/react/offline';
import type { GameSettings } from '@shared/types/settings';
import { Box } from '../../../../../../design-system/primitives/Box';
import { Button } from '../../../../../../design-system/primitives/Button';
import { Text } from '../../../../../../design-system/primitives/Text';
import { EmptyState } from '../../../../../../design-system/primitives/EmptyState';
import { SearchSpark } from '../../../../../../design-system/composites/SearchSpark';
import { SettingsPageContext } from '../../../../compounds/SettingsLayout';
import { PROFILE_HUB_TABS } from '../../ProfileHub.constants';
import { ProfileHubTabContent, type ProfileHubTabContentProps } from '../ProfileHubTabContent';
import { matchTabs } from './match-tabs';
import type { ProfileHubTab } from '../../ProfileHub.type';
import './HubSearchResults.css';

type HubSearchResultsProps = Omit<ProfileHubTabContentProps, 'tab'> & {
  query: string;
  tabs: readonly ProfileHubTab[];
  settings: GameSettings;
  onOpenTab: (tab: ProfileHubTab) => void;
};

const IDLE_MARK_SIZE = 40;

const HubSearchResults = (props: HubSearchResultsProps) => {
  const { query, tabs, onOpenTab, ...content } = props;
  const q = query.trim().toLowerCase();
  const matches = useMemo(() => matchTabs(tabs, content.settings, q), [tabs, content.settings, q]);
  const noun = matches.total === 1 ? 'setting matches' : 'settings match';

  if (!q) {
    return (
      <Box as="section" className="hub-search hub-search--idle" aria-label="Search">
        <EmptyState
          className="hub-search__empty"
          icon={<SearchSpark size={IDLE_MARK_SIZE} />}
          message="Type to search every setting, on every tab."
        />
      </Box>
    );
  }

  return (
    <Box as="section" className="hub-search" aria-label="Search results">
      <Box className="hub-search__head">
        <Text className="hub-search__summary">
          {matches.total > 0 ? `${matches.total} ${noun} "${query.trim()}"` : `No setting matches "${query.trim()}"`}
        </Text>
        {matches.byName.length > 0 && (
          <Box className="hub-search__tabs">
            {matches.byName.map((tab) => (
              <Button key={tab} variant="bare" className="hub-search__tab-chip" onClick={() => onOpenTab(tab)}>
                <IconifyIcon icon={PROFILE_HUB_TABS[tab].navIcon} aria-hidden="true" />
                Open {PROFILE_HUB_TABS[tab].label}
              </Button>
            ))}
          </Box>
        )}
      </Box>

      <Box className="hub-search__body">
        {matches.total === 0 && (
          <EmptyState className="hub-search__empty" message="Try a shorter word, or the name of what the setting changes." />
        )}
        {matches.withRows.map(({ tab, count }) => {
          const spec = PROFILE_HUB_TABS[tab];
          const icon = <IconifyIcon icon={spec.navIcon} />;
          return (
            <Box as="section" key={tab} className="hub-search__group" aria-label={spec.label}>
              <Box className="hub-search__group-head">
                <Box as="span" className="hub-search__group-icon" aria-hidden="true">{icon}</Box>
                <Text as="h3" className="hub-search__group-title">{spec.label}</Text>
                <Text className="hub-search__group-count">{count}</Text>
                <Button variant="bare" className="hub-search__open" onClick={() => onOpenTab(tab)}>Open tab</Button>
              </Box>
              <SettingsPageContext.Provider value={{ variant: 'results', icon, title: spec.label, query: q }}>
                <ProfileHubTabContent {...content} tab={tab} />
              </SettingsPageContext.Provider>
            </Box>
          );
        })}
      </Box>
    </Box>
  );
};

export { HubSearchResults };
