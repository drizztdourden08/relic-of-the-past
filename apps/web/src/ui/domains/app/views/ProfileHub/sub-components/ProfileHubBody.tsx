/* @layer renderer-components @kind component */
/**
 * ProfileHub's nav and content pane. The pane shows the active tab as a page.
 * While the search field has focus or holds text, no tab is selected and the
 * pane shows the search: an empty state until something is typed, then every
 * matching setting from every tab. Picking a tab (from the nav or a result),
 * or leaving the field empty, ends the search.
 */
import { useCallback, useMemo, useState } from 'react';
import { Icon as IconifyIcon } from '@iconify/react/offline';
import type { GameSettings } from '@shared/types/settings';
import { Box } from '../../../../../design-system/primitives/Box';
import { SectionNav, type SectionNavConfig } from '../../../../../design-system/composites/SectionNav';
import { RandomizerLockContext, SettingsPageContext } from '../../../compounds/SettingsLayout';
import { SceneBackdrop } from '../../../../title';
import { usePlatform } from '@app/platform';
import { PROFILE_HUB_NAV_GROUPS, PROFILE_HUB_TABS } from '../ProfileHub.constants';
import { ProfileHubTabContent } from './ProfileHubTabContent';
import { HubSearchResults } from './hub-search/HubSearchResults';
import type { ProfileHubProps, ProfileHubTab } from '../ProfileHub.type';

interface ProfileHubBodyProps {
  activeTab: ProfileHubTab;
  setActiveTab: (t: ProfileHubTab) => void;
  settings: GameSettings;
  onChange: (patch: Partial<GameSettings>) => void;
  profile: ProfileHubProps['profile'];
  isGameRunning: boolean;
  onStartGame: () => void;
  onStopGame: () => void;
  onResetGame: () => void;
}

/** A page header is short, so its water line sits low to keep the castle in view. */
const HEADER_HORIZON = 0.72;

const navItem = (tab: ProfileHubTab) => ({
  id: tab,
  label: PROFILE_HUB_TABS[tab].label,
  icon: <IconifyIcon icon={PROFILE_HUB_TABS[tab].navIcon} />,
});

const ProfileHubBody = (props: ProfileHubBodyProps) => {
  const { activeTab, setActiveTab, settings, onChange, profile, isGameRunning, onStartGame, onStopGame, onResetGame } = props;
  const { info } = usePlatform();
  const [query, setQuery] = useState('');
  const [searchFocused, setSearchFocused] = useState(false);
  // In the field, or holding a query: no tab is current and the pane belongs to the search.
  const searching = searchFocused || query.trim() !== '';

  // Mobile options have their own tab, listed last and only on mobile.
  const groups = useMemo(
    () => PROFILE_HUB_NAV_GROUPS.map((group) => ({
      ...group,
      tabs: group.tabs.filter((tab) => !PROFILE_HUB_TABS[tab].mobileOnly || info.formFactor === 'mobile'),
    })),
    [info.formFactor],
  );
  const navConfig = useMemo<SectionNavConfig>(() => ({
    home: navItem('home'),
    groups: groups.map((group) => ({ id: group.id, label: group.label, items: group.tabs.map(navItem) })),
  }), [groups]);
  const searchableTabs = useMemo(() => groups.flatMap((group) => group.tabs), [groups]);

  const openTab = useCallback((tab: ProfileHubTab) => {
    setQuery('');
    setActiveTab(tab);
  }, [setActiveTab]);

  // Keys the profile's randomizer config pins; SettingsLayout locks these controls.
  const randomizerFrozenKeys = useMemo(
    () => Object.keys(profile.randomizer?.frozenSettings ?? {}),
    [profile.randomizer],
  );

  const spec = PROFILE_HUB_TABS[activeTab];
  const pageContext = useMemo(
    () => ({ variant: 'page' as const, icon: <IconifyIcon icon={spec.navIcon} />, title: spec.label, backdrop: <SceneBackdrop horizon={HEADER_HORIZON} />, query: '' }),
    [spec],
  );
  const content = { settings, onChange, profile, isGameRunning, onStartGame, onStopGame, onResetGame };

  return (
    <RandomizerLockContext.Provider value={randomizerFrozenKeys}>
      <Box className="profile-hub__body">
        <SectionNav
          config={navConfig}
          activeId={searching ? '' : activeTab}
          onSelect={(id) => openTab(id as ProfileHubTab)}
          search={{ value: query, onChange: setQuery, placeholder: 'Search all settings', onFocusChange: setSearchFocused }}
        />

        <Box className="profile-hub__content">
          {searching
            ? <HubSearchResults {...content} query={query} tabs={searchableTabs} onOpenTab={openTab} />
            : (
              <SettingsPageContext.Provider value={pageContext}>
                <ProfileHubTabContent {...content} tab={activeTab} />
              </SettingsPageContext.Provider>
            )}
        </Box>
      </Box>
    </RandomizerLockContext.Provider>
  );
};

export { ProfileHubBody };
