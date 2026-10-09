/* @layer renderer-components @kind component */
import { useCallback, useMemo, useState } from 'react';
import { Icon as IconifyIcon } from '@iconify/react/offline';
import { Box } from '@drizztdourden08/tessera/primitives';
import { SideNav, type SideNavConfig } from '@drizztdourden08/tessera/composites';
import { RandomizerLockContext, SettingsPageContext } from '../../../compounds/SettingsLayout';
import { SceneBackdrop } from '../../../../title';
import { usePlatform } from '@app/platform';
import { runKindOfProfile } from '@app/lib/game/randomizer-client';
import { isHubTabShown, PROFILE_HUB_NAV_GROUPS, PROFILE_HUB_TABS } from '../ProfileHub.constants';
import { ProfileHubTabContent } from './ProfileHubTabContent';
import { HubSearchResults } from './hub-search/HubSearchResults';
import type { ProfileHubTab } from '../ProfileHub.type';
import { HEADER_HORIZON } from './ProfileHubBody.constants';
import type { ProfileHubBodyProps } from './ProfileHubBody.type';

const navItem = (tab: ProfileHubTab) => ({
  id: tab,
  label: PROFILE_HUB_TABS[tab].label,
  icon: <IconifyIcon icon={PROFILE_HUB_TABS[tab].navIcon} />,
});

const ProfileHubBody = (props: ProfileHubBodyProps) => {
  const { activeTab: chosenTab, setActiveTab, settings, onChange, profile, isGameRunning, onStartGame, onStopGame, onResetGame } = props;
  const { info } = usePlatform();
  const [query, setQuery] = useState('');
  const [searchFocused, setSearchFocused] = useState(false);
  const searching = searchFocused || query.trim() !== '';
  const isOnline = runKindOfProfile(profile.randomizer) === 'online';
  const activeTab = chosenTab === 'online' && !isOnline ? 'home' : chosenTab;

  const groups = useMemo(
    () => PROFILE_HUB_NAV_GROUPS.map((group) => ({
      ...group,
      tabs: group.tabs.filter((tab) => isHubTabShown(PROFILE_HUB_TABS[tab], { isMobile: info.formFactor === 'mobile', isOnline })),
    })),
    [info.formFactor, isOnline],
  );
  const navConfig = useMemo<SideNavConfig>(() => ({
    home: navItem('home'),
    groups: groups.map((group) => ({ id: group.id, label: group.label, items: group.tabs.map(navItem) })),
  }), [groups]);
  const searchableTabs = useMemo(() => groups.flatMap((group) => group.tabs), [groups]);

  const openTab = useCallback((tab: ProfileHubTab) => {
    setQuery('');
    setActiveTab(tab);
  }, [setActiveTab]);
  const handleSelect = useCallback((id: string) => openTab(id as ProfileHubTab), [openTab]);
  const search = useMemo(
    () => ({ value: query, onChange: setQuery, placeholder: 'Search all settings', onFocusChange: setSearchFocused }),
    [query],
  );

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
        <SideNav
          config={navConfig}
          activeId={searching ? '' : activeTab}
          onSelect={handleSelect}
          search={search}
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
