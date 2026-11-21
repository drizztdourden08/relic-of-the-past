/* @layer renderer-components @kind component */
import { useT } from '@drizztdourden08/brock-react';
import { useMemo, useState } from 'react';
import { Stack, Tabs } from '@drizztdourden08/tessera/primitives';
import { modeOf } from './mode-of';
import { ProfileDataTab } from './ProfileDataTab';
import { ProfileDetailHeader } from './ProfileDetailHeader';
import { ProfileLobbyStatus } from './ProfileLobbyStatus';
import { ProfileOverviewTab } from './ProfileOverviewTab';
import { ProfileRandomizerTab } from './ProfileRandomizerTab';
import { ProfileSettingsTab } from './ProfileSettingsTab';
import { baseTabs, DATA_TAB, OVERVIEW_TAB, RANDOMIZER_TAB, randomizerTabItem, SETTINGS_TAB } from './profile-detail-tabs.constants';
import type { ProfileDetailPanelProps } from './profile-detail.type';
import './ProfileDetailPanel.css';

const ProfileDetailPanel = (props: ProfileDetailPanelProps) => {
  const { profile, settings, languages, msuPacks, onSelectProfile, onDeleteProfile, onRefresh } = props;
  const { randomizer } = profile;
  const t = useT();
  const [tab, setTab] = useState<string>(OVERVIEW_TAB);
  const mode = modeOf(profile, settings);
  const tabs = useMemo(() => (randomizer ? [...baseTabs(t), randomizerTabItem(t)] : baseTabs(t)), [randomizer, t]);

  return (
    <Stack gap="lg" className="profile-detail">
      <ProfileDetailHeader
        profile={profile}
        mode={mode}
        onOpen={() => onSelectProfile(profile)}
        onDelete={() => onDeleteProfile(profile.id)}
      />
      {randomizer?.mode === 'archipelia' && <ProfileLobbyStatus profile={profile} />}
      <Tabs tabs={tabs} activeTab={tab} onTabChange={setTab} />
      {tab === SETTINGS_TAB && <ProfileSettingsTab settings={settings} />}
      {tab === DATA_TAB && <ProfileDataTab profile={profile} settings={settings} />}
      {tab === RANDOMIZER_TAB && randomizer && <ProfileRandomizerTab randomizer={randomizer} />}
      {tab === OVERVIEW_TAB && (
        <ProfileOverviewTab profile={profile} mode={mode} languages={languages} msuPacks={msuPacks} onRefresh={onRefresh} />
      )}
    </Stack>
  );
};

export { ProfileDetailPanel };
